// server/src/services/aiService.ts
import { GoogleGenerativeAI, Content, InputContent } from "@google/generative-ai";

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

// Define our custom chat message type for internal use
export interface ChatMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

// Function to convert our messages to Google's expected format
function convertToGoogleFormat(messages: ChatMessage[]): Content[] {
	return messages.map((msg) => ({
		role: msg.role,
		parts: [{ text: msg.content }],
	}));
}

// Function to generate responses for the chat feature
export async function generateChatResponse(userMessage: string, chatHistory: ChatMessage[] = []): Promise<string> {
	if (!userMessage) {
		throw new Error("Message cannot be empty.");
	}

	console.log(`Generating chat response for: ${userMessage.substring(0, 30)}...`);

	try {
		// Initialize the model - using gemini-1.5-pro for best responses
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		// System instruction for the AI
		const systemInstruction: ChatMessage = {
			role: "system",
			content: `
        You are WaveeAI, a helpful, friendly and intelligent assistant that specializes in content creation,
        writing assistance, and answering questions. You're concise but informative, and you try to provide 
        actionable information. Keep your responses friendly, helpful, and accurate. If you don't know 
        something, be honest about it.
      `,
		};

		// Combine system instruction with chat history
		const allMessages = [systemInstruction, ...chatHistory];

		// Convert messages to Google's format
		const googleFormatMessages = convertToGoogleFormat(allMessages);

		// Prepare the chat
		const chat = model.startChat({
			history: googleFormatMessages,
			generationConfig: {
				temperature: 0.7,
				topP: 0.9,
				topK: 40,
				maxOutputTokens: 1024,
			},
		});

		// Generate the response
		const result = await chat.sendMessage(userMessage);
		const response = result.response;
		const text = response.text();

		if (!text) {
			throw new Error("AI response content was empty.");
		}

		console.log("Chat response generated successfully.");
		return text.trim();
	} catch (error: any) {
		console.error("Error calling Google Gemini for chat:", error.message || error);

		// Create a meaningful error message
		const errorMessage = error.message || "Failed to generate chat response.";

		// Define fallback responses for different error scenarios
		const fallbackResponses = [
			"I'm having trouble connecting right now. Could you try asking again?",
			"I couldn't process your request. Let me know if you'd like to try a different question.",
			"Sorry, I encountered an issue while generating a response. Please try again.",
		];

		// Return a random fallback response for non-critical errors
		if (error.code !== "CRITICAL_ERROR") {
			return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
		}

		// For critical errors, throw the error to be handled by the route
		throw new Error(`Failed to generate chat response: ${errorMessage}`);
	}
}
