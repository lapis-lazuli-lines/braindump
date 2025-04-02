// client/src/hooks/useAnnouncement.ts
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook for making screen reader announcements
 * @param politeness ARIA live politeness setting
 */
export function useAnnouncement(politeness: "polite" | "assertive" = "polite") {
	const [message, setMessage] = useState("");
	const timeoutRef = useRef<number | null>(null);

	// Function to set a message that will be announced to screen readers
	const announce = useCallback((newMessage: string, timeout = 500) => {
		// Clear any existing timeout
		if (timeoutRef.current !== null) {
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		// Clear the current message first to ensure it's announced even if the same
		setMessage("");

		// Set the new message after a small delay
		timeoutRef.current = window.setTimeout(() => {
			setMessage(newMessage);
		}, 10);

		// Clear the message after the specified timeout
		if (timeout > 0) {
			timeoutRef.current = window.setTimeout(() => {
				setMessage("");
			}, timeout);
		}
	}, []);

	// Clean up on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current !== null) {
				window.clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	// Component to be rendered for the live region
	const LiveRegion = useCallback(() => {
		return (
			<div aria-live={politeness} aria-atomic="true" className="sr-only" role={politeness === "assertive" ? "alert" : undefined}>
				{message}
			</div>
		);
	}, [message, politeness]);

	return { announce, LiveRegion };
}
