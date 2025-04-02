// client/src/components/workflow/SaveWorkflowModal.tsx
import React, { useState } from "react";
import Modal from "@/components/common/Modal";
import { useWorkflowStore } from "./workflowStore";

interface SaveWorkflowModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: () => void;
}

const SaveWorkflowModal: React.FC<SaveWorkflowModalProps> = ({ isOpen, onClose, onSave }) => {
	const [workflowName, setWorkflowName] = useState("");
	const [error, setError] = useState("");
	const { saveWorkflow, getSavedWorkflows } = useWorkflowStore();

	const handleSave = () => {
		if (!workflowName.trim()) {
			setError("Please enter a workflow name");
			return;
		}

		// Check if name already exists
		const savedWorkflows = getSavedWorkflows();
		const nameExists = savedWorkflows.some((w: any) => w.name === workflowName);

		if (nameExists) {
			setError("A workflow with this name already exists");
			return;
		}

		// Save the workflow
		saveWorkflow(workflowName);

		// Reset and close
		setWorkflowName("");
		setError("");
		onSave();
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Save Workflow">
			<div className="space-y-4">
				<div>
					<label htmlFor="workflow-name" className="block text-sm font-medium text-gray-700 mb-1">
						Workflow Name
					</label>
					<input
						id="workflow-name"
						type="text"
						value={workflowName}
						onChange={(e) => setWorkflowName(e.target.value)}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a2783]"
						placeholder="My Content Workflow"
					/>
					{error && <p className="text-red-500 text-xs mt-1">{error}</p>}
				</div>

				<div className="flex justify-end space-x-2">
					<button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
						Cancel
					</button>
					<button onClick={handleSave} className="px-4 py-2 bg-[#5a2783] text-white rounded-md hover:bg-[#6b2f9c]">
						Save Workflow
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default SaveWorkflowModal;
