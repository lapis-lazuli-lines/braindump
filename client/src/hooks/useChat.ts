// client/src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid"; // You'll need to add this dependency
import { Message, ChatSession, ChatError } from "@/types/chat";
import chatApi from "@/api/chatApi";
import { performance } from "@/utils/performance";
import { useError } from "@/contexts/ErrorContext";

interface UseChatOptions {
	initialMessages?: Message[];
	sessionId?: string;
	onError?: (error: ChatError) => void;
}

export function useChat({ initialMessages = [], sessionId: initialSessionId, onError }: UseChatOptions = {}) {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
	const [error, setError] = useState<ChatError | null>(null);
	const { setGlobalError } = useError();

	// Use refs to keep track of the current request ID for cancellation
	const currentRequestId = useRef<string | null>(null);

	// Cleanup function to cancel ongoing requests when component unmounts
	useEffect(() => {
		return () => {
			if (currentRequestId.current) {
				chatApi.cancelRequest(currentRequestId.current);
			}
			chatApi.cancelAllChatRequests();
		};
	}, []);

	// Function to send a message to the AI
	const sendMessage = useCallback(
		async (text: string) => {
			if (!text.trim() || isGenerating) return null;

			setError(null);

			// Generate unique IDs for messages
			const userMessageId = uuidv4();
			const aiMessageId = uuidv4();
			currentRequestId.current = uuidv4();

			// Create user message
			const userMessage: Message = {
				id: userMessageId,
				text,
				sender: "user",
				timestamp: new Date(),
				status: "sending",
			};

			// Add user message to the messages array
			setMessages((prevMessages) => [...prevMessages, userMessage]);

			// Update user message to "sent" status
			setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === userMessageId ? { ...msg, status: "sent" } : msg)));

			// Create a placeholder for the AI response with a "sending" status
			const aiPlaceholderMessage: Message = {
				id: aiMessageId,
				text: "",
				sender: "ai",
				timestamp: new Date(),
				status: "sending",
			};

			// Add AI placeholder message to the messages array
			setMessages((prevMessages) => [...prevMessages, aiPlaceholderMessage]);

			// Set generating state to true
			setIsGenerating(true);

			try {
				// Track performance
				performance.mark("chat-send-start");

				// Send the message to the API
				const response = await chatApi.sendMessage(text, sessionId);

				// Track performance
				performance.mark("chat-send-end");
				performance.measure("chat-send-time", "chat-send-start", "chat-send-end");

				// If this is a new chat, set the session ID
				if (response.sessionId && !sessionId) {
					setSessionId(response.sessionId);
				}

				// Update the AI message with the response
				setMessages((prevMessages) =>
					prevMessages.map((msg) =>
						msg.id === aiMessageId
							? {
									...msg,
									text: response.text,
									status: "sent",
									timestamp: new Date(response.timestamp),
							  }
							: msg
					)
				);

				return response;
			} catch (err) {
				// Handle errors
				const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";

				const chatError: ChatError = {
					message: errorMessage,
					code: (err as ChatError)?.code || "UNKNOWN_ERROR",
					status: (err as ChatError)?.status || 500,
				};

				// Set error state
				setError(chatError);

				// Update the AI message to show the error
				setMessages((prevMessages) =>
					prevMessages.map((msg) =>
						msg.id === aiMessageId
							? {
									...msg,
									text: "Sorry, I couldn't process your request. Please try again.",
									status: "error",
									error: errorMessage,
							  }
							: msg
					)
				);

				// Call onError callback if provided
				if (onError) {
					onError(chatError);
				} else {
					// Otherwise, set global error
					setGlobalError(`Chat error: ${errorMessage}`);
				}

				return null;
			} finally {
				// Reset generating state
				setIsGenerating(false);
				currentRequestId.current = null;
			}
		},
		[isGenerating, sessionId, onError, setGlobalError]
	);

	// Function to clear chat messages
	const clearMessages = useCallback(() => {
		setMessages([]);
	}, []);

	// Function to load a specific chat session
	const loadChatSession = useCallback(
		async (chatSessionId: string) => {
			try {
				setIsGenerating(true);
				const session = await chatApi.getChatSession(chatSessionId);
				setSessionId(session.id);
				setMessages(session.messages);
				return session;
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to load chat session";

				const chatError: ChatError = {
					message: errorMessage,
					code: (err as ChatError)?.code || "SESSION_LOAD_ERROR",
					status: (err as ChatError)?.status || 500,
				};

				setError(chatError);

				if (onError) {
					onError(chatError);
				} else {
					setGlobalError(`Failed to load chat: ${errorMessage}`);
				}

				return null;
			} finally {
				setIsGenerating(false);
			}
		},
		[onError, setGlobalError]
	);

	// Function to cancel the current request
	const cancelRequest = useCallback(() => {
		if (currentRequestId.current) {
			chatApi.cancelRequest(currentRequestId.current);
			currentRequestId.current = null;

			// Find the pending AI message and mark it as cancelled
			setMessages((prevMessages) => {
				const lastAiMessage = [...prevMessages].reverse().find((msg) => msg.sender === "ai" && msg.status === "sending");

				if (lastAiMessage) {
					return prevMessages.map((msg) =>
						msg.id === lastAiMessage.id
							? {
									...msg,
									text: "Message generation was cancelled.",
									status: "error",
									error: "CANCELLED",
							  }
							: msg
					);
				}
				return prevMessages;
			});

			setIsGenerating(false);
		}
	}, []);

	return {
		messages,
		isGenerating,
		error,
		sessionId,
		sendMessage,
		clearMessages,
		loadChatSession,
		cancelRequest,
	};
}
