// server/src/services/dbService.ts
import { supabase } from "../utils/supabaseClient";
import { SavedDraft, MediaFile, CombinedContent, DbServiceResponse } from "../types/database";

/**
 * Saves a draft to the database
 *
 * @param prompt The content prompt
 * @param draft The generated draft text
 * @param userId Optional user ID
 * @param image Optional image data
 * @param platform Optional platform data
 * @param mediaFiles Optional array of media files to associate
 * @returns The saved draft object
 */
export const saveDraft = async (
	prompt: string,
	draft: string,
	userId?: string,
	image?: { id: string; url: string; credit: string; creditUrl: string },
	platform?: string,
	mediaFiles?: MediaFile[]
): Promise<SavedDraft> => {
	console.log("Saving draft to Supabase...");

	// Create draft object
	const draftData: SavedDraft = {
		prompt,
		draft,
		user_id: userId,
		platform,
		image,
	};

	// Insert draft and return data
	const { data, error } = await supabase.from("saved_drafts").insert([draftData]).select().single();

	if (error) {
		console.error("Supabase error saving draft:", error);
		throw new Error(`Supabase error: ${error.message}`);
	}

	if (!data) {
		console.error("Supabase returned no data after insert.");
		throw new Error("Failed to save draft: No data returned.");
	}

	// If media files are provided, associate them with the draft
	if (mediaFiles && mediaFiles.length > 0 && data.id) {
		try {
			const mediaAssociations = mediaFiles.map((media) => ({
				draft_id: data.id,
				media_id: media.id,
			}));

			const { error: assocError } = await supabase.from("draft_media").insert(mediaAssociations);

			if (assocError) {
				console.error("Error associating media with draft:", assocError);
				// Don't throw here, continue with draft saved
			}
		} catch (mediaError) {
			console.error("Error processing media associations:", mediaError);
			// Don't throw here, continue with draft saved
		}
	}

	console.log("Draft saved successfully:", data);
	return data as SavedDraft;
};

/**
 * Gets all saved drafts
 *
 * @param userId Optional user ID to filter drafts by user
 * @returns Array of saved drafts
 */
export const getSavedDrafts = async (userId?: string): Promise<SavedDraft[]> => {
	console.log("Fetching saved drafts from Supabase...");

	let query = supabase.from("saved_drafts").select("*").order("created_at", { ascending: false });

	// Filter by user if provided
	if (userId) {
		query = query.eq("user_id", userId);
	}

	const { data, error } = await query;

	if (error) {
		console.error("Supabase error fetching drafts:", error);
		throw new Error(`Supabase error: ${error.message}`);
	}

	// Get media files for each draft
	const draftsWithMedia = await Promise.all(
		(data as SavedDraft[]).map(async (draft) => {
			if (!draft.id) return draft;

			const { data: mediaAssociations, error: mediaError } = await supabase.from("draft_media").select("media_id").eq("draft_id", draft.id);

			if (mediaError || !mediaAssociations.length) {
				return draft;
			}

			const mediaIds = mediaAssociations.map((assoc) => assoc.media_id);

			const { data: mediaFiles } = await supabase.from("media_files").select("*").in("id", mediaIds);

			return {
				...draft,
				media_files: mediaFiles as MediaFile[],
			};
		})
	);

	console.log(`Fetched ${draftsWithMedia.length || 0} drafts.`);
	return draftsWithMedia || [];
};

/**
 * Saves combined content for a draft
 *
 * @param draftId The ID of the draft
 * @param combinedContent The combined content HTML/markdown
 * @param userId Optional user ID
 * @param platform Optional platform
 * @returns The saved combined content object
 */
export const saveCombinedContent = async (draftId: string, combinedContent: string, userId?: string, platform?: string): Promise<DbServiceResponse<CombinedContent>> => {
	try {
		console.log(`Saving combined content for draft ${draftId}...`);

		// Check if content already exists
		const { data: existingData, error: checkError } = await supabase.from("combined_content").select("*").eq("draft_id", draftId).single();

		if (checkError && checkError.code !== "PGRST116") {
			// PGRST116 is the "not found" error
			console.error("Error checking for existing combined content:", checkError);
			return {
				success: false,
				error: `Database error: ${checkError.message}`,
				statusCode: 500,
			};
		}

		let result;

		if (existingData) {
			// Update existing record
			const { data, error } = await supabase
				.from("combined_content")
				.update({
					content: combinedContent,
					platform,
					updated_at: new Date().toISOString(),
				})
				.eq("id", existingData.id)
				.select()
				.single();

			if (error) {
				console.error("Error updating combined content:", error);
				return {
					success: false,
					error: `Failed to update combined content: ${error.message}`,
					statusCode: 500,
				};
			}

			result = data;
		} else {
			// Create new record
			const { data, error } = await supabase
				.from("combined_content")
				.insert([
					{
						draft_id: draftId,
						content: combinedContent,
						user_id: userId,
						platform,
						created_at: new Date().toISOString(),
					},
				])
				.select()
				.single();

			if (error) {
				console.error("Error saving combined content:", error);
				return {
					success: false,
					error: `Failed to save combined content: ${error.message}`,
					statusCode: 500,
				};
			}

			result = data;
		}

		// Also update the draft with a reference to the combined content
		await supabase
			.from("saved_drafts")
			.update({
				combined_content: combinedContent,
				updated_at: new Date().toISOString(),
			})
			.eq("id", draftId);

		console.log("Combined content saved successfully");
		return {
			success: true,
			data: result as CombinedContent,
		};
	} catch (error: any) {
		console.error("Unexpected error in saveCombinedContent:", error);
		return {
			success: false,
			error: `Unexpected error: ${error.message || "Unknown error"}`,
			statusCode: 500,
		};
	}
};

/**
 * Deletes a draft and its associated data
 *
 * @param draftId The ID of the draft to delete
 * @returns A boolean indicating if the deletion was successful
 */
export const deleteDraft = async (draftId: string): Promise<boolean> => {
	try {
		console.log(`Deleting draft ${draftId}...`);

		// First, delete any associated media references
		const { error: mediaError } = await supabase.from("draft_media").delete().eq("draft_id", draftId);

		if (mediaError) {
			console.error("Error deleting draft media associations:", mediaError);
			// Continue with deletion
		}

		// Delete any combined content
		const { error: contentError } = await supabase.from("combined_content").delete().eq("draft_id", draftId);

		if (contentError) {
			console.error("Error deleting combined content:", contentError);
			// Continue with deletion
		}

		// Delete the draft itself
		const { error } = await supabase.from("saved_drafts").delete().eq("id", draftId);

		if (error) {
			console.error("Error deleting draft:", error);
			return false;
		}

		console.log(`Draft ${draftId} deleted successfully`);
		return true;
	} catch (error) {
		console.error("Unexpected error in deleteDraft:", error);
		return false;
	}
};

/**
 * Gets a single draft by ID
 *
 * @param draftId The ID of the draft to retrieve
 * @returns The draft object or null if not found
 */
export const getDraftById = async (draftId: string): Promise<SavedDraft | null> => {
	try {
		console.log(`Fetching draft ${draftId}...`);

		const { data, error } = await supabase.from("saved_drafts").select("*").eq("id", draftId).single();

		if (error) {
			console.error("Error fetching draft:", error);
			return null;
		}

		// Get associated media files
		const { data: mediaAssociations, error: mediaError } = await supabase.from("draft_media").select("media_id").eq("draft_id", draftId);

		if (!mediaError && mediaAssociations.length > 0) {
			const mediaIds = mediaAssociations.map((assoc) => assoc.media_id);

			const { data: mediaFiles } = await supabase.from("media_files").select("*").in("id", mediaIds);

			return {
				...data,
				media_files: mediaFiles as MediaFile[],
			};
		}

		return data as SavedDraft;
	} catch (error) {
		console.error("Unexpected error in getDraftById:", error);
		return null;
	}
};
