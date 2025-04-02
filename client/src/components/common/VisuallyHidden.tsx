// client/src/components/common/VisuallyHidden.tsx
import React, { ReactNode } from "react";

interface VisuallyHiddenProps {
	children: ReactNode;
	as?: keyof JSX.IntrinsicElements;
}

/**
 * Component to visually hide content but keep it accessible to screen readers
 */
const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, as: Component = "span" }) => {
	return (
		<Component
			className="absolute h-px w-px p-0 overflow-hidden whitespace-nowrap border-0"
			style={{
				clip: "rect(0, 0, 0, 0)",
				clipPath: "inset(50%)",
				margin: "-1px",
			}}>
			{children}
		</Component>
	);
};

export default VisuallyHidden;
