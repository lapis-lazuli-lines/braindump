// src/components/wavee/ChatInput.tsx
import React, { useState } from "react";

interface ChatInputProps {
	onSendMessage?: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
	const [message, setMessage] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (message.trim() && onSendMessage) {
			onSendMessage(message);
			setMessage("");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="bg-white p-4 border-t border-gray-100 flex items-center">
			<button type="button" className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
					/>
				</svg>
			</button>
			<button type="button" className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 ml-2">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
					/>
				</svg>
			</button>
			<div className="flex-1 mx-4">
				<input
					type="text"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Start typing"
					className="w-full px-4 py-2 bg-gray-100 border border-gray-100 rounded-full text-gray-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-300"
				/>
			</div>
			<button type="submit" className="p-2 rounded-full bg-[#e03885] text-white hover:bg-pink-600" disabled={!message.trim()}>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</button>
		</form>
	);
};

export default ChatInput;
