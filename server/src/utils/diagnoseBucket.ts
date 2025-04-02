// test-bucket-access.ts
// Save in server/src/utils/ and run with: npx ts-node src/utils/test-bucket-access.ts

import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const MEDIA_BUCKET = "user-media";

async function testBucketAccess() {
	console.log("🧪 BUCKET ACCESS TEST 🧪");
	console.log("========================");

	// Check environment variables
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		console.error("❌ Error: Supabase URL or Anon Key not found in environment variables.");
		return;
	}

	console.log("✅ Environment variables found");
	console.log(`URL: ${supabaseUrl}`);
	console.log(`Key Length: ${supabaseAnonKey.length} characters`);

	// Initialize Supabase client
	console.log("\n🔄 Initializing Supabase client...");
	const supabase = createClient(supabaseUrl, supabaseAnonKey);

	try {
		// Test 1: List buckets
		console.log("\n🧪 TEST 1: Listing buckets");
		const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

		if (bucketsError) {
			console.error("❌ Error listing buckets:", bucketsError);
			console.log("👉 This indicates a connection or authentication issue.");
			return;
		} else {
			console.log("✅ Successfully listed buckets");
			console.log(`Found ${buckets.length} buckets: ${buckets.map((b) => b.name).join(", ")}`);

			// Check if our target bucket exists
			const bucketExists = buckets.some((b) => b.name === MEDIA_BUCKET);
			if (bucketExists) {
				console.log(`✅ Bucket "${MEDIA_BUCKET}" exists`);
			} else {
				console.error(`❌ Bucket "${MEDIA_BUCKET}" not found`);
				return;
			}
		}

		// Test 2: List files in bucket
		console.log("\n🧪 TEST 2: Listing files in bucket");
		const { data: files, error: filesError } = await supabase.storage.from(MEDIA_BUCKET).list();

		if (filesError) {
			console.error(`❌ Error listing files in bucket: ${filesError.message}`);
			console.log("👉 This indicates an RLS policy issue.");
			console.log("   You need to add a SELECT policy for this bucket.");

			// Show detailed information about the error
			console.log("\nDetailed error information:");
			console.log(JSON.stringify(filesError, null, 2));
		} else {
			console.log(`✅ Successfully listed files in bucket "${MEDIA_BUCKET}"`);
			console.log(`Found ${files.length} files/folders`);
		}

		// Test 3: Try to upload a small test file
		console.log("\n🧪 TEST 3: Uploading test file");
		const testData = new Uint8Array([0, 1, 2, 3, 4]); // 5 bytes of data
		const testFilePath = `test-${Date.now()}.bin`;

		const { data: uploadData, error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(testFilePath, testData);

		if (uploadError) {
			console.error(`❌ Error uploading test file: ${uploadError.message}`);
			console.log("👉 This indicates an RLS policy issue.");
			console.log("   You need to add an INSERT policy for this bucket.");

			// Show detailed information about the error
			console.log("\nDetailed error information:");
			console.log(JSON.stringify(uploadError, null, 2));
		} else {
			console.log("✅ Successfully uploaded test file");

			// If upload succeeded, try to delete it
			console.log("\n🧪 TEST 4: Deleting test file");
			const { data: deleteData, error: deleteError } = await supabase.storage.from(MEDIA_BUCKET).remove([testFilePath]);

			if (deleteError) {
				console.error(`❌ Error deleting test file: ${deleteError.message}`);
				console.log("👉 You need to add a DELETE policy for this bucket.");
			} else {
				console.log("✅ Successfully deleted test file");
			}
		}

		// Final status summary
		console.log("\n📊 TEST SUMMARY");
		console.log("==============");
		console.log("Bucket exists: ✅");
		console.log(`List bucket contents: ${filesError ? "❌" : "✅"}`);
		console.log(`Upload files: ${uploadError ? "❌" : "✅"}`);

		// Provide guidance based on results
		if (filesError || uploadError) {
			console.log("\n⚠️ Policy configuration needed!");
			console.log("Follow these steps to fix RLS policies:");
			console.log("1. Go to Supabase dashboard → Storage → Policies");
			console.log(`2. Select the "${MEDIA_BUCKET}" bucket`);
			console.log("3. Click 'New Policy'");
			console.log("4. For development, create these policies:");
			console.log("   - SELECT policy: set definition to 'true'");
			console.log("   - INSERT policy: set definition to 'true'");
			console.log("   - UPDATE policy: set definition to 'true'");
			console.log("   - DELETE policy: set definition to 'true'");
		} else {
			console.log("\n🎉 Your bucket appears to be correctly configured!");
		}
	} catch (error) {
		console.error("❌ Unexpected error:", error);
	}
}

testBucketAccess();
