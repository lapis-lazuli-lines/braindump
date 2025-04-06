import React from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

// Import visualization components
import VisualizationIntegrationAdapter from "@/components/workflow/visualization/integration/VisualizationIntegrationAdapter";
import EnhancedWorkflowCreator from "./EnhancedWorkflowCreator";

// Main application component that integrates the workflow with visualization
const WorkflowApp: React.FC = () => {
	return (
		<ReactFlowProvider>
			<VisualizationIntegrationAdapter showControlPanel={true} controlPanelPosition="floating" showDataPreview={true}>
				<EnhancedWorkflowCreator />
			</VisualizationIntegrationAdapter>
		</ReactFlowProvider>
	);
};

export default WorkflowApp;
