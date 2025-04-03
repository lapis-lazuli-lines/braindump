// client/src/components/workflow/custom/EditableField.tsx
import React, { useState, useRef, useEffect } from "react";

interface EditableFieldProps {
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	isEditing: boolean;
	onEditingChange: (editing: boolean) => void;
	placeholder?: string;
	multiline?: boolean;
	className?: string;
	maxLength?: number;
}

const EditableField: React.FC<EditableFieldProps> = ({
	value,
	onChange,
	onBlur,
	isEditing,
	onEditingChange,
	placeholder = "Enter value...",
	multiline = false,
	className = "",
	maxLength,
}) => {
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
	const [localValue, setLocalValue] = useState(value);

	// Focus the input when editing starts
	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();

			// Place cursor at the end of the text
			if ("selectionStart" in inputRef.current) {
				inputRef.current.selectionStart = inputRef.current.value.length;
			}
		}
	}, [isEditing]);

	// Update local value when external value changes
	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setLocalValue(newValue);
		onChange(newValue);
	};

	const handleBlur = () => {
		onEditingChange(false);
		if (onBlur) onBlur();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !multiline) {
			onEditingChange(false);
			if (onBlur) onBlur();
		} else if (e.key === "Escape") {
			setLocalValue(value); // Reset to original value
			onEditingChange(false);
			if (onBlur) onBlur();
		}
	};

	if (isEditing) {
		if (multiline) {
			return (
				<textarea
					ref={inputRef as React.RefObject<HTMLTextAreaElement>}
					value={localValue}
					onChange={handleChange}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className={`w-full px-2 py-1 border border-purple-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${className}`}
					maxLength={maxLength}
					rows={3}
				/>
			);
		}

		return (
			<input
				ref={inputRef as React.RefObject<HTMLInputElement>}
				type="text"
				value={localValue}
				onChange={handleChange}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className={`w-full px-2 py-1 border border-purple-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 ${className}`}
				maxLength={maxLength}
			/>
		);
	}

	// Render as text when not editing
	return (
		<div className={`${className} cursor-pointer px-2 py-1 rounded-md hover:bg-gray-50`} onClick={() => onEditingChange(true)} title="Double-click to edit">
			{value || <span className="text-gray-400 italic text-sm">{placeholder}</span>}
		</div>
	);
};

export default EditableField;
