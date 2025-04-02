// client/src/hooks/useMemoizedCallback.ts
import { useCallback, useRef } from "react";

/**
 * Similar to useCallback, but guarantees the callback reference
 * remains stable even if dependencies change
 *
 * @param callback The callback function
 * @returns A memoized callback that will always have the same reference
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(callback: T): T {
	// Store the callback in a ref
	const callbackRef = useRef(callback);

	// Update the ref whenever the callback changes
	callbackRef.current = callback;

	// Create a stable callback that always calls the current callback
	const memoizedCallback = useCallback((...args: any[]) => callbackRef.current(...args), []);

	return memoizedCallback as T;
}
