// client/src/components/wavee/ChatInterface.tsx
import React, { useState, useEffect, useRef } from "react";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { performance } from "@/utils/performance";

interface Message {
	id: string;
	text: string;
	sender: "user" | "ai";
	timestamp: Date;
}

interface ChatInterfaceProps {
	initialMessages?: Message[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialMessages = [] }) => {
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [inputValue, setInputValue] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { announce, LiveRegion } = useAnnouncement();

	// Auto-focus input on component mount
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}

		// Performance tracking
		performance.mark("chat-interface-mount");

		return () => {
			performance.mark("chat-interface-unmount");
			performance.measure("chat-interface-lifecycle", "chat-interface-mount", "chat-interface-unmount");
		};
	}, []);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

		// Announce new message for screen readers if there are any messages
		if (messages.length > 0) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage.sender === "ai") {
				announce(`New response: ${lastMessage.text.substring(0, 100)}${lastMessage.text.length > 100 ? "..." : ""}`);
			}
		}
	}, [messages, announce]);

	// Sample AI response function (would be replaced with actual API call)
	const getAIResponse = async (userMessage: string): Promise<string> => {
		// Measure response time for performance monitoring
		return performance.measureTime(async () => {
			// Simulate API delay
			return new Promise((resolve) => {
				setTimeout(() => {
					const responses = [
						"I understand what you're asking about. Let me help with that.",
						"That's an interesting question. Here's what I know about it.",
						"I'd be happy to assist with that. Here's some information that might help.",
						"Great question! Here's what I can tell you about that topic.",
					];
					const randomResponse = responses[Math.floor(Math.random() * responses.length)];
					resolve(`${randomResponse} (In response to: ${userMessage})`);
				}, 1000);
			});
		}, "ai-response-time");
	};

	const handleSendMessage = async () => {
		const text = inputValue.trim();
		if (!text || isGenerating) return;

		// Clear input field
		setInputValue("");

		// Add user message
		const userMessage: Message = {
			id: Date.now().toString(),
			text,
			sender: "user",
			timestamp: new Date(),
		};

		setMessages((prevMessages) => [...prevMessages, userMessage]);

		// Show generating indicator
		setIsGenerating(true);

		try {
			// Get AI response
			const aiResponseText = await getAIResponse(text);

			// Add AI message
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: aiResponseText,
				sender: "ai",
				timestamp: new Date(),
			};

			setMessages((prevMessages) => [...prevMessages, aiMessage]);
		} catch (error) {
			console.error("Error getting AI response:", error);

			// Add error message
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: "Sorry, I had trouble processing your request. Please try again.",
				sender: "ai",
				timestamp: new Date(),
			};

			setMessages((prevMessages) => [...prevMessages, errorMessage]);
			announce("Error generating response. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	// Format timestamp
	const formatTime = (date: Date): string => {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	return (
		<div className="flex-1 flex flex-col overflow-hidden" role="region" aria-label="Chat conversation">
			<LiveRegion />

			{/* Messages area */}
			<div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
				<div className="max-w-3xl mx-auto space-y-4 mb-4">
					{messages.length === 0 ? (
						<div className="flex items-center justify-center h-full">
							<div className="text-center text-gray-500">
								<p>No messages yet. Start a conversation!</p>
							</div>
						</div>
					) : (
						<>
							{messages.map((message) => (
								<div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
									<div
										className={`max-w-[80%] rounded-2xl px-4 py-3 ${
											message.sender === "user" ? "bg-[#e03885] text-white" : "bg-white border border-gray-200 text-gray-800"
										}`}
										role={message.sender === "user" ? "complementary" : "complementary"}
										aria-label={message.sender === "user" ? "Your message" : "AI response"}>
										<div className="flex flex-col">
											<span className="break-words">{message.text}</span>
											<span className={`text-xs mt-1 self-end ${message.sender === "user" ? "text-pink-100" : "text-gray-500"}`}>
												{formatTime(message.timestamp)}
											</span>
										</div>
									</div>
								</div>
							))}
							<div ref={messagesEndRef} />
						</>
					)}
				</div>
			</div>

			{/* Input form */}
			<div className="bg-white p-4 border-t border-gray-100">
				<div className="max-w-3xl mx-auto">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSendMessage();
						}}
						className="flex items-center gap-2">
						<button
							type="button"
							className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
							aria-label="Attach file">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
								/>
							</svg>
						</button>

						<div className="flex-1">
							<label htmlFor="chat-message" className="sr-only">
								Type your message
							</label>
							<input
								type="text"
								id="chat-message"
								ref={inputRef}
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								placeholder="Type your message..."
								className="w-full px-4 py-2 bg-gray-100 border border-gray-100 rounded-full text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
								disabled={isGenerating}
								aria-disabled={isGenerating}
							/>
						</div>

						<button
							type="submit"
							className="p-2 rounded-full bg-[#e03885] text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!inputValue.trim() || isGenerating}
							aria-label={isGenerating ? "Generating response..." : "Send message"}>
							{isGenerating ? (
								<LoadingSpinner size="sm" color="white" />
							) : (
								<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
								</svg>
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ChatInterface;
