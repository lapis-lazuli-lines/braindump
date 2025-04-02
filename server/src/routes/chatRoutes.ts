// server/src/routes/chatRoutes.ts
import express, { Request, Response, Router, RequestHandler } from "express";
import { generateChatResponse, ChatMessage as AIChatMessage } from "../services/aiService";
import { v4 as uuidv4 } from "uuid";

const router: Router = express.Router();

// Store chat sessions in memory (in production, use a database)
interface ChatMessage {
	id: string;
	text: string;
	sender: "user" | "ai";
	timestamp: Date;
}

interface ChatSession {
	id: string;
	title: string;
	messages: ChatMessage[];
	createdAt: Date;
	updatedAt: Date;
}

// In-memory storage (replace with database in production)
const chatSessions = new Map<string, ChatSession>();

// POST /api/chat/message
router.post("/message", (async (req: Request, res: Response) => {
	const { message, sessionId } = req.body;

	if (!message || typeof message !== "string") {
		return res.status(400).json({ error: "Message (string) is required." });
	}

	try {
		// Get or create session
		let session: ChatSession;
		const now = new Date();

		if (sessionId && chatSessions.has(sessionId)) {
			// Use existing session
			session = chatSessions.get(sessionId)!;
			session.updatedAt = now;
		} else {
			// Create new session
			const newSessionId = uuidv4();
			session = {
				id: newSessionId,
				title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
				messages: [],
				createdAt: now,
				updatedAt: now,
			};
			chatSessions.set(newSessionId, session);
		}

		// Add user message to session
		const userMessage: ChatMessage = {
			id: uuidv4(),
			text: message,
			sender: "user",
			timestamp: now,
		};
		session.messages.push(userMessage);

		// Generate AI response using the AI service
		// First, prepare chat history for context and map to correct types
		const chatHistory: AIChatMessage[] = session.messages
			.filter((msg) => msg.id !== userMessage.id) // Exclude current message
			.slice(-10) // Use only last 10 messages for context
			.map((msg) => ({
				role: msg.sender === "user" ? "user" : ("assistant" as AIChatMessage["role"]),
				content: msg.text,
			}));

		const aiResponseText = await generateChatResponse(message, chatHistory);

		// Create AI message
		const aiMessage: ChatMessage = {
			id: uuidv4(),
			text: aiResponseText,
			sender: "ai",
			timestamp: new Date(),
		};

		// Add AI message to session
		session.messages.push(aiMessage);

		// Send response
		res.json({
			id: aiMessage.id,
			text: aiMessage.text,
			timestamp: aiMessage.timestamp,
			sessionId: session.id,
		});
	} catch (error: any) {
		console.error("Error in /message route:", error);
		res.status(500).json({ error: error.message || "Failed to generate response." });
	}
}) as RequestHandler);

// GET /api/chat/history
router.get("/history", (async (_req: Request, res: Response) => {
	try {
		// Convert Map to array and sort by updatedAt (newest first)
		const sessions = Array.from(chatSessions.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

		res.json({ sessions });
	} catch (error: any) {
		console.error("Error in /history route:", error);
		res.status(500).json({ error: error.message || "Failed to retrieve chat history." });
	}
}) as RequestHandler);

// GET /api/chat/session/:id
router.get("/session/:id", (async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ error: "Session ID is required." });
	}

	try {
		// Get session by ID
		const session = chatSessions.get(id);

		if (!session) {
			return res.status(404).json({ error: "Chat session not found." });
		}

		res.json(session);
	} catch (error: any) {
		console.error("Error in /session/:id route:", error);
		res.status(500).json({ error: error.message || "Failed to retrieve chat session." });
	}
}) as RequestHandler);

// DELETE /api/chat/session/:id
router.delete("/session/:id", (async (req: Request, res: Response) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ error: "Session ID is required." });
	}

	try {
		// Check if session exists
		if (!chatSessions.has(id)) {
			return res.status(404).json({ error: "Chat session not found." });
		}

		// Delete session
		chatSessions.delete(id);

		res.status(200).json({ success: true, message: "Chat session deleted." });
	} catch (error: any) {
		console.error("Error in DELETE /session/:id route:", error);
		res.status(500).json({ error: error.message || "Failed to delete chat session." });
	}
}) as RequestHandler);

export default router;
