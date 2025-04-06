// src/components/workflow/EnhancedWorkflowCreator.tsx
import React from "react";
import "reactflow/dist/style.css";

// Import visualization components
import VisualizationIntegrationAdapter from "@/components/workflow/visualization/integration/VisualizationIntegrationAdapter";
import WorkflowController from "./WorkflowController"; // Use the actual component you want to render

// Main application component that integrates the workflow with visualization
const WorkflowApp = () => {
	return (
		<VisualizationIntegrationAdapter showControlPanel={true} controlPanelPosition="floating" showDataPreview={true}>
			<WorkflowController />
		</VisualizationIntegrationAdapter>
	);
};

export default WorkflowApp;
