// client/src/hooks/useFocusTrap.ts
import { useEffect, useRef } from "react";

/**
 * Hook to trap focus within a container (for modals, dialogs, etc.)
 * @param isActive Whether the focus trap is active
 * @returns Ref to be attached to the container element
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean = true) {
	const containerRef = useRef<T>(null);

	useEffect(() => {
		if (!isActive || !containerRef.current) return;

		// Save the active element to restore focus when trap is disabled
		const previousActiveElement = document.activeElement as HTMLElement;

		// Elements that can receive focus
		const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

		// Get all focusable elements inside the container
		const focusableContent = containerRef.current.querySelectorAll<HTMLElement>(focusableElements);

		if (focusableContent.length === 0) return;

		const firstFocusableElement = focusableContent[0];
		const lastFocusableElement = focusableContent[focusableContent.length - 1];

		// Focus the first element when the trap is activated
		firstFocusableElement.focus();

		// Handle tab key presses to cycle within the container
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			// Shift + Tab
			if (e.shiftKey) {
				if (document.activeElement === firstFocusableElement) {
					lastFocusableElement.focus();
					e.preventDefault();
				}
			}
			// Tab
			else {
				if (document.activeElement === lastFocusableElement) {
					firstFocusableElement.focus();
					e.preventDefault();
				}
			}
		};

		// Add event listener
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			// Clean up event listener
			document.removeEventListener("keydown", handleKeyDown);

			// Restore focus when trap is disabled
			if (previousActiveElement) {
				previousActiveElement.focus();
			}
		};
	}, [isActive]);

	return containerRef;
}
