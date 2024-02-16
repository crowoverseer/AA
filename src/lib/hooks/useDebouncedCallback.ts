import { useRef, useCallback } from "react";

export function useDebouncedCallback<TArgs extends Array<unknown>>(
	func: (...args: TArgs) => void,
	wait: number,
) {
	// Use a ref to store the timeout between renders
	// and prevent changes to it from causing re-renders
	const timeout = useRef<NodeJS.Timeout>();

	return useCallback(
		(...args: TArgs) => {
			const later = () => {
				clearTimeout(timeout.current);
				func(...args);
			};

			clearTimeout(timeout.current);
			timeout.current = setTimeout(later, wait);
		},
		[func, wait],
	);
}
