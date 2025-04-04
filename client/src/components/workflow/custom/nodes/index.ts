// client/src/components/workflow/custom/nodes/index.ts
import PlatformNode from "../../customNodes/PlatformNode";
import ConditionalNode from "../../customNodes/ConditionalNode";
import { PlatformNodeEditContent, ConditionalNodeEditContent } from "../edit/NodeEditableContent";

// Import the functions directly from NodeDetailsPanel.tsx
import { renderPlatformSelectionDetails, renderConditionalNodeDetails, toggleStyles } from "../NodeDetailsPanel";

// Export all components in one place for easy import
export { PlatformNode, ConditionalNode, PlatformNodeEditContent, ConditionalNodeEditContent, renderPlatformSelectionDetails, renderConditionalNodeDetails, toggleStyles };
