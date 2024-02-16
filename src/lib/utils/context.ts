import { createContext as createReactContext, useContext } from "react";

export const createContext = <T extends Record<string, unknown> | null>(
	name: string,
	defaultValue?: T,
): readonly [() => T, React.Provider<T | undefined>] => {
	const ctx = createReactContext<T | undefined>(defaultValue);

	const useCtx = (): T => {
		const c = useContext(ctx);

		if (c === undefined) {
			throw new Error(`useCtx must be inside a ${name}Provider with a value`);
		}

		return c;
	};

	return [useCtx, ctx.Provider] as const;
};
