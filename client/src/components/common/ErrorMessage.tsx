// client/src/components/common/ErrorMessage.tsx
import React from "react";

interface ErrorMessageProps {
	message: string | null;
	className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = "" }) => {
	if (!message) return null;

	return (
		<div className={`p-3 bg-red-100 text-red-700 rounded-lg text-sm ${className}`} role="alert">
			<div className="flex items-start">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
						clipRule="evenodd"
					/>
				</svg>
				<span>{message}</span>
			</div>
		</div>
	);
};

export default ErrorMessage;
