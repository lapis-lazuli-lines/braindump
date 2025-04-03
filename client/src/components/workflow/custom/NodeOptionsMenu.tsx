// client/src/components/workflow/custom/NodeOptionsMenu.tsx
import React, { useState, useRef, useEffect } from "react";

interface NodeOptionsMenuProps {
	isOpen: boolean;
	onClose: () => void;
	onEdit: () => void;
	onDelete: () => void;
	position?: { x: number; y: number };
}

const NodeOptionsMenu: React.FC<NodeOptionsMenuProps> = ({ isOpen, onClose, onEdit, onDelete, position }) => {
	const menuRef = useRef<HTMLDivElement>(null);

	// Handle click outside to close the menu
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			ref={menuRef}
			className="absolute z-10 bg-white rounded-lg shadow-lg py-2 min-w-[150px]"
			style={
				position
					? {
							top: `${position.y}px`,
							left: `${position.x}px`,
					  }
					: { top: "0px", right: "0px" }
			}>
			<button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" onClick={onEdit}>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
				Edit Node
			</button>
			<button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center" onClick={onDelete}>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
				Delete Node
			</button>
		</div>
	);
};

export default NodeOptionsMenu;
