// client/src/hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState, RefObject } from "react";

interface IntersectionObserverOptions extends IntersectionObserverInit {
	freezeOnceVisible?: boolean;
}

/**
 * Hook that utilizes Intersection Observer API to tell if an element is visible in viewport
 */
export function useIntersectionObserver<T extends HTMLElement>(
	options: IntersectionObserverOptions = {
		threshold: 0,
		freezeOnceVisible: true,
	}
): [RefObject<T>, boolean] {
	const { threshold, root, rootMargin, freezeOnceVisible } = options;

	const elementRef = useRef<T>(null);
	const [isVisible, setIsVisible] = useState<boolean>(false);

	const frozen = isVisible && freezeOnceVisible;

	useEffect(() => {
		const element = elementRef.current;
		if (!element || frozen) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsVisible(entry.isIntersecting);
			},
			{ threshold, root, rootMargin }
		);

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, [threshold, root, rootMargin, frozen]);

	return [elementRef, isVisible];
}
