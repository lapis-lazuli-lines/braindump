// client/src/components/workflow/HelpModal.tsx
import React from "react";
import Modal from "@/components/common/Modal";

interface HelpModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Workflow Editor Help">
			<div className="space-y-6">
				<div>
					<h3 className="text-lg font-bold text-gray-800 mb-2">Getting Started</h3>
					<p className="text-gray-600">The Workflow Editor allows you to create custom content creation pipelines by connecting different nodes together.</p>
				</div>

				<div>
					<h3 className="text-lg font-bold text-gray-800 mb-2">Basic Controls</h3>
					<ul className="list-disc pl-5 space-y-2 text-gray-600">
						<li>
							<strong>Drag</strong> nodes from the left panel to the canvas.
						</li>
						<li>
							<strong>Connect</strong> nodes by dragging from a handle (dot) to another node's handle.
						</li>
						<li>
							<strong>Delete</strong> nodes by selecting them and pressing Delete or Backspace.
						</li>
						<li>
							<strong>Pan</strong> the canvas by dragging the background.
						</li>
						<li>
							<strong>Zoom</strong> in/out using the mouse wheel or the controls in the bottom right.
						</li>
					</ul>
				</div>

				<div>
					<h3 className="text-lg font-bold text-gray-800 mb-2">Node Types</h3>
					<div className="space-y-4">
						<div className="flex items-start">
							<div className="bg-[#1e0936] text-white p-2 rounded-lg mr-3 flex-shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div>
								<h4 className="font-medium text-gray-800">Trigger</h4>
								<p className="text-sm text-gray-600">Starting point of your workflow. Every workflow must begin with a trigger.</p>
							</div>
						</div>

						<div className="flex items-start">
							<div className="bg-[#5a2783] text-white p-2 rounded-lg mr-3 flex-shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
								</svg>
							</div>
							<div>
								<h4 className="font-medium text-gray-800">Content Ideas</h4>
								<p className="text-sm text-gray-600">Generate content ideas based on a topic. Enter a topic and select an idea to pass to the next node.</p>
							</div>
						</div>

						<div className="flex items-start">
							<div className="bg-[#e03885] text-white p-2 rounded-lg mr-3 flex-shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
								</svg>
							</div>
							<div>
								<h4 className="font-medium text-gray-800">Draft Generator</h4>
								<p className="text-sm text-gray-600">Create content drafts based on the selected idea or a custom prompt.</p>
							</div>
						</div>

						<div className="flex items-start">
							<div className="bg-blue-500 text-white p-2 rounded-lg mr-3 flex-shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
								</svg>
							</div>
							<div>
								<h4 className="font-medium text-gray-800">Media Selector</h4>
								<p className="text-sm text-gray-600">Search for and select images to enhance your content.</p>
							</div>
						</div>

						<div className="flex items-start">
							<div className="bg-purple-500 text-white p-2 rounded-lg mr-3 flex-shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
								</svg>
							</div>
							<div>
								<h4 className="font-medium text-gray-800">Platform Selector</h4>
								<p className="text-sm text-gray-600">Choose which platform to publish your content to.</p>
							</div>
						</div>

						<div className="flex items-start">
							<div className="bg-amber-500 text-white p-2 rounded-lg mr-3 flex-shrink-0">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path
										fillRule="evenodd"
										d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div>
								<h4 className="font-medium text-gray-800">Conditional Branch</h4>
								<p className="text-sm text-gray-600">Add decision points to your workflow based on different conditions.</p>
							</div>
						</div>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-bold text-gray-800 mb-2">Executing Your Workflow</h3>
					<p className="text-gray-600">
						Click the "Execute Workflow" button to run your workflow from start to finish. The results will be displayed at the bottom of the screen.
					</p>
				</div>
			</div>
		</Modal>
	);
};

export default HelpModal;
