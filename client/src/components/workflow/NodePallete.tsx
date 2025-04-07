import React from "react";

const NodePalette = () => {
	const nodeTypes = [
		{
			type: "ideaNode",
			label: "Content Ideas",
			description: "Generate content ideas based on a topic",
			color: "#7c3aed", // Purple
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
					/>
				</svg>
			),
		},
		{
			type: "draftNode",
			label: "Draft Generator",
			description: "Create content draft from selected idea",
			color: "#e03885", // Pink
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
			),
		},
		{
			type: "mediaNode",
			label: "Add Media",
			description: "Select images or videos for your content",
			color: "#3b82f6", // Blue
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			),
		},
		{
			type: "platformNode",
			label: "Select Platform",
			description: "Choose where to publish your content",
			color: "#8b5cf6", // Purple
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
					/>
				</svg>
			),
		},
		{
			type: "conditionalNode",
			label: "Conditional",
			description: "Branch workflow based on conditions",
			color: "#f59e0b", // Amber
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
				</svg>
			),
		},
		// Add enhanced node: audienceNode
		{
			type: "audienceNode",
			label: "Target Audience",
			description: "Define the target audience for your content",
			color: "#059669", // Green
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
					/>
				</svg>
			),
		},
		// Add enhanced node: previewNode
		{
			type: "previewNode",
			label: "Content Preview",
			description: "Preview how your content will appear on the selected platform",
			color: "#0369a1", // Blue
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
					/>
				</svg>
			),
		},
		// Add enhanced node: hashtagNode
		{
			type: "hashtagNode",
			label: "Hashtag Generator",
			description: "Generate relevant hashtags for your content",
			color: "#0891b2", // Cyan
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
				</svg>
			),
		},
		// Add enhanced node: scheduleNode
		{
			type: "scheduleNode",
			label: "Schedule Post",
			description: "Set a time to publish your content",
			color: "#0d9488", // Teal
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			),
		},
		// Add enhanced node: publishNode
		{
			type: "publishNode",
			label: "Publish Content",
			description: "Publish or queue your content to the selected platform",
			color: "#10b981", // Emerald
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
					/>
				</svg>
			),
		},
		// Add enhanced node: analyticsNode
		{
			type: "analyticsNode",
			label: "Analytics Tracking",
			description: "Configure analytics for tracking content performance",
			color: "#6366f1", // Indigo
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					/>
				</svg>
			),
		},
	];

	const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
		event.dataTransfer.setData("application/reactflow", nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<div className="node-palette">
			<div className="palette-header">
				<h2>Node Library</h2>
				<p className="palette-description">Drag nodes onto the canvas to create your workflow</p>
			</div>

			<div className="node-list">
				{nodeTypes.map((nodeType) => (
					<div
						key={nodeType.type}
						className="node-item"
						onDragStart={(e) => onDragStart(e, nodeType.type)}
						draggable
						style={{
							borderLeft: `4px solid ${nodeType.color}`,
						}}>
						<div className="node-icon" style={{ backgroundColor: nodeType.color }}>
							{nodeType.icon}
						</div>
						<div className="node-info">
							<h3>{nodeType.label}</h3>
							<p>{nodeType.description}</p>
						</div>
					</div>
				))}
			</div>

			<div className="help-section">
				<div className="help-header">
					<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<h3>How to use</h3>
				</div>
				<ul className="help-tips">
					<li>Drag nodes from here to the canvas</li>
					<li>Connect nodes by dragging between handles</li>
					<li>Click a node to edit its properties</li>
					<li>Delete nodes with the Delete key</li>
				</ul>
			</div>

			<style>{`
				.node-palette {
					padding: 16px;
					height: 100%;
					display: flex;
					flex-direction: column;
				}

				.palette-header {
					margin-bottom: 20px;
					padding-bottom: 12px;
					border-bottom: 1px solid #e5e7eb;
				}

				.palette-header h2 {
					font-size: 18px;
					font-weight: 600;
					color: #111827;
					margin-bottom: 4px;
				}

				.palette-description {
					font-size: 13px;
					color: #6b7280;
				}

				.node-list {
					flex: 1;
					overflow-y: auto;
					display: flex;
					flex-direction: column;
					gap: 12px;
				}

				.node-item {
					background-color: white;
					border-radius: 8px;
					padding: 12px;
					display: flex;
					align-items: center;
					cursor: grab;
					transition: all 0.2s;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
				}

				.node-item:hover {
					box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
					transform: translateY(-2px);
				}

				.node-item:active {
					cursor: grabbing;
				}

				.node-icon {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 40px;
					height: 40px;
					border-radius: 8px;
					color: white;
					flex-shrink: 0;
				}

				.node-info {
					margin-left: 12px;
					overflow: hidden;
				}

				.node-info h3 {
					font-size: 14px;
					font-weight: 600;
					color: #111827;
					margin-bottom: 2px;
				}

				.node-info p {
					font-size: 12px;
					color: #6b7280;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.help-section {
					margin-top: 20px;
					padding-top: 16px;
					border-top: 1px solid #e5e7eb;
				}

				.help-header {
					display: flex;
					align-items: center;
					color: #5a2783;
					margin-bottom: 8px;
				}

				.help-header h3 {
					font-size: 14px;
					font-weight: 600;
					margin-left: 6px;
				}

				.help-tips {
					list-style-type: none;
					padding-left: 10px;
					font-size: 12px;
					color: #6b7280;
				}

				.help-tips li {
					position: relative;
					padding-left: 16px;
					margin-bottom: 6px;
				}

				.help-tips li:before {
					content: "•";
					position: absolute;
					left: 0;
					color: #5a2783;
				}
			`}</style>
		</div>
	);
};

export default NodePalette;
