// client/src/api/chatApi.ts
import axios, { AxiosResponse, CancelTokenSource } from "axios";
import { ChatResponse, ChatError, Message, ChatSession } from "@/types/chat";
import { handleApiError } from "./apiClient";
import { v4 as uuidv4 } from "uuid"; // You'll need to add this dependency

// Chat API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const CHAT_ENDPOINT = `${API_URL}/api/chat`;

// Map to track active requests for cancellation
const activeRequests = new Map<string, CancelTokenSource>();

// Create a dedicated axios instance for chat API
const chatAxios = axios.create({
	baseURL: CHAT_ENDPOINT,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 30000, // 30 seconds timeout for longer AI responses
});

// Request interceptor
chatAxios.interceptors.request.use((config) => {
	// Cancel previous requests with the same ID if they exist
	const requestId = config.headers["X-Request-Id"] as string;
	if (requestId && activeRequests.has(requestId)) {
		const source = activeRequests.get(requestId);
		source?.cancel(`Request cancelled due to new request: ${requestId}`);
		activeRequests.delete(requestId);
	}

	// Create a new cancel token
	const source = axios.CancelToken.source();
	config.cancelToken = source.token;

	if (requestId) {
		activeRequests.set(requestId, source);
	}

	// Add authorization header if needed
	const token = localStorage.getItem("authToken");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

// Response interceptor
chatAxios.interceptors.response.use(
	(response) => {
		// Clean up request from activeRequests
		const requestId = response.config.headers["X-Request-Id"] as string;
		if (requestId && activeRequests.has(requestId)) {
			activeRequests.delete(requestId);
		}
		return response;
	},
	(error) => {
		// Handle cancellation
		if (axios.isCancel(error)) {
			console.log("Request cancelled:", error.message);
			return Promise.reject({ isCancelled: true, message: error.message });
		}

		// Clean up request from activeRequests
		if (error.config?.headers["X-Request-Id"]) {
			const requestId = error.config.headers["X-Request-Id"] as string;
			if (activeRequests.has(requestId)) {
				activeRequests.delete(requestId);
			}
		}

		return Promise.reject(error);
	}
);

// Function to send a message to the AI
export const sendMessage = async (message: string, sessionId?: string): Promise<ChatResponse> => {
	const requestId = uuidv4();
	try {
		const response: AxiosResponse<ChatResponse> = await chatAxios.post(
			"/message",
			{
				message,
				sessionId,
			},
			{
				headers: {
					"X-Request-Id": requestId,
				},
			}
		);
		return response.data;
	} catch (error) {
		// Use the generic error handler from apiClient
		const apiError = handleApiError(error);

		// Create a typed error object
		const chatError: ChatError = {
			message: apiError?.message || "Failed to send message",
			status: apiError?.status,
			code: "CHAT_SEND_ERROR",
		};

		throw chatError;
	}
};

// Function to cancel a specific request
export const cancelRequest = (requestId: string): void => {
	if (activeRequests.has(requestId)) {
		const source = activeRequests.get(requestId);
		source?.cancel(`Request manually cancelled: ${requestId}`);
		activeRequests.delete(requestId);
	}
};

// Function to cancel all active chat requests (e.g. on unmount)
export const cancelAllChatRequests = (): void => {
	activeRequests.forEach((source, key) => {
		source.cancel(`Request cancelled during cleanup: ${key}`);
	});
	activeRequests.clear();
};

// Function to get chat history
export const getChatHistory = async (): Promise<ChatSession[]> => {
	try {
		const response: AxiosResponse<{ sessions: ChatSession[] }> = await chatAxios.get("/history");
		return response.data.sessions.map((session) => ({
			...session,
			createdAt: new Date(session.createdAt),
			updatedAt: new Date(session.updatedAt),
			messages: session.messages.map((msg) => ({
				...msg,
				timestamp: new Date(msg.timestamp),
			})),
		}));
	} catch (error) {
		const apiError = handleApiError(error);
		const chatError: ChatError = {
			message: apiError?.message || "Failed to retrieve chat history",
			status: apiError?.status,
			code: "CHAT_HISTORY_ERROR",
		};
		throw chatError;
	}
};

// Function to get a specific chat session
export const getChatSession = async (sessionId: string): Promise<ChatSession> => {
	try {
		const response: AxiosResponse<ChatSession> = await chatAxios.get(`/session/${sessionId}`);
		const session = response.data;
		return {
			...session,
			createdAt: new Date(session.createdAt),
			updatedAt: new Date(session.updatedAt),
			messages: session.messages.map((msg) => ({
				...msg,
				timestamp: new Date(msg.timestamp),
			})),
		};
	} catch (error) {
		const apiError = handleApiError(error);
		const chatError: ChatError = {
			message: apiError?.message || "Failed to retrieve chat session",
			status: apiError?.status,
			code: "CHAT_SESSION_ERROR",
		};
		throw chatError;
	}
};

// Function to delete a chat session
export const deleteChatSession = async (sessionId: string): Promise<boolean> => {
	try {
		await chatAxios.delete(`/session/${sessionId}`);
		return true;
	} catch (error) {
		const apiError = handleApiError(error);
		const chatError: ChatError = {
			message: apiError?.message || "Failed to delete chat session",
			status: apiError?.status,
			code: "CHAT_DELETE_ERROR",
		};
		throw chatError;
	}
};

// Create a hook-friendly implementation of the AI message service
export const chatApi = {
	sendMessage,
	cancelRequest,
	cancelAllChatRequests,
	getChatHistory,
	getChatSession,
	deleteChatSession,
};

export default chatApi;
