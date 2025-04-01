// server/src/services/aiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey) {
	console.error("ERROR: GOOGLE_API_KEY environment variable not set.");
	// Throw an error to prevent the application from starting without a valid API key
	throw new Error("GOOGLE_API_KEY is required");
}

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(googleApiKey);

export async function generateContentIdeas(topic: string): Promise<string[]> {
	if (!topic) {
		throw new Error("Topic cannot be empty.");
	}
	console.log(`Generating ideas for topic: ${topic}`);
	try {
		// Initialize the model
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		// Create the prompt
		const prompt = `
			Generate 5 diverse content ideas (like blog titles, social media hooks, questions) based on the following topic: "${topic}".
			Present them as a numbered list.
		`;

		// Generate content
		const result = await model.generateContent(prompt);
		const response = result.response;
		const content = response.text();

		if (!content) throw new Error("AI response content was empty.");
		console.log("Raw AI response (Ideas):", content);

		// Parse the numbered list
		const ideas = content
			.split("\n")
			.map((line) => line.replace(/^\d+\.?\s*/, "").trim())
			.filter((line) => line.length > 0);

		if (ideas.length === 0) return [content.trim()]; // Fallback
		return ideas;
	} catch (error: any) {
		console.error("Error calling Google Gemini for ideas:", error.message || error);
		throw new Error("Failed to generate content ideas from AI.");
	}
}

export async function generateDraft(prompt: string): Promise<string> {
	if (!prompt) {
		throw new Error("Prompt cannot be empty.");
	}
	console.log(`Generating draft for prompt: ${prompt}`);
	try {
		// Initialize the model
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		// Create the prompt
		const systemPrompt = `
			You are a helpful writing assistant. Write a short introductory paragraph or a brief outline 
			for the given content idea/prompt. Keep it concise but engaging.
		`;

		const finalPrompt = `${systemPrompt}\n\nContent Idea/Prompt: ${prompt}`;

		// Generate content
		const result = await model.generateContent(finalPrompt);
		const response = result.response;
		const draft = response.text();

		if (!draft) throw new Error("AI response content for draft was empty.");
		console.log("Raw AI response (Draft):", draft);
		return draft.trim();
	} catch (error: any) {
		console.error("Error calling Google Gemini for draft:", error.message || error);
		throw new Error("Failed to generate draft from AI.");
	}
}
