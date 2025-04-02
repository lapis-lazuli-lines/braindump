// client/src/components/common/Modal.tsx
import React, { useEffect } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import VisuallyHidden from "./VisuallyHidden";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = "" }) => {
	// Explicitly type the ref as HTMLDivElement
	const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

	// Handle escape key to close the modal
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		// Prevent scrolling of the body when modal is open
		if (isOpen) {
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	// Click outside to close
	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
			onClick={handleBackdropClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title">
			<div ref={modalRef} className={`bg-white rounded-xl shadow-xl overflow-hidden max-w-lg w-full mx-4 max-h-[90vh] ${className}`}>
				<div className="flex justify-between items-center p-4 border-b border-gray-200">
					<h2 id="modal-title" className="text-xl font-semibold text-gray-800">
						{title}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5a2783] rounded-md"
						aria-label="Close modal">
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
						<VisuallyHidden>Close</VisuallyHidden>
					</button>
				</div>

				<div className="overflow-y-auto p-4 max-h-[calc(90vh-8rem)]">{children}</div>
			</div>
		</div>
	);
};

export default React.memo(Modal);
