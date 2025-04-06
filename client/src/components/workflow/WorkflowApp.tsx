// src/components/workflow/WorkflowApp.tsx
import React from "react";
import "reactflow/dist/style.css";
import WorkflowController from "./WorkflowController";
import VisualizationIntegrationAdapter from "./visualization/integration/VisualizationIntegrationAdapter";

const WorkflowApp: React.FC = () => {
	return (
		<div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
			<VisualizationIntegrationAdapter showControlPanel={true} controlPanelPosition="floating" showDataPreview={true}>
				<WorkflowController />
			</VisualizationIntegrationAdapter>
		</div>
	);
};

export default WorkflowApp;
