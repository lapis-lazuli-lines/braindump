// client/src/components/workflow/customNodes/index.tsx
import TriggerNode from "./TriggerNode";
import IdeaNode from "./IdeaNode";
import DraftNode from "./DraftNode";
import MediaNode from "./MediaNode";
import PlatformNode from "./PlatformNode";
import ConditionalNode from "./ConditionalNode";

export const nodeTypes = {
	triggerNode: TriggerNode,
	ideaNode: IdeaNode,
	draftNode: DraftNode,
	mediaNode: MediaNode,
	platformNode: PlatformNode,
	conditionalNode: ConditionalNode,
};

export default nodeTypes;
