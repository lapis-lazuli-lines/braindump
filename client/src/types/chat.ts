// client/src/types/chat.ts
export interface Message {
	id: string;
	text: string;
	sender: "user" | "ai";
	timestamp: Date;
	status?: "sending" | "sent" | "error";
	error?: string;
}

export interface ChatSession {
	id: string;
	title: string;
	messages: Message[];
	createdAt: Date;
	updatedAt: Date;
}

export interface ChatResponse {
	sessionId: boolean;
	id: string;
	text: string;
	timestamp: Date;
}

export interface ChatError {
	message: string;
	code?: string;
	status?: number;
}
