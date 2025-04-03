// client/src/components/workflow/customNodes/index.tsx
import { IdeaNode, DraftNode, MediaNode, PlatformNode, ConditionalNode } from "../custom/StyledNodes";

export const nodeTypes = {
	ideaNode: IdeaNode,
	draftNode: DraftNode,
	mediaNode: MediaNode,
	platformNode: PlatformNode,
	conditionalNode: ConditionalNode,
};

export default nodeTypes;
