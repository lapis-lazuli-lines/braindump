import ModernWorkflowCreator from "./ModernWorkflowCreator";

/**
 * This component wraps the Modern Workflow Creator and provides a proper container
 * for displaying it in the application layout
 */
const WorkflowCreator = () => {
	return (
		<div className="workflow-creator-container">
			<ModernWorkflowCreator />

			<style>{`
				.workflow-creator-container {
					width: 100%;
					height: 100vh;
					background-color: #f9fafb;
					overflow: hidden;
				}
			`}</style>
		</div>
	);
};

export default WorkflowCreator;
