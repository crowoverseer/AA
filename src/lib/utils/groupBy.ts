export function groupBy<T, TKey extends string | number>(
	arr: T[],
	fn: (item: T) => TKey,
) {
	return arr.reduce<Record<TKey, T[]>>((prev, curr) => {
		const groupKey = fn(curr);
		const group = prev[groupKey] || [];
		group.push(curr);

		return { ...prev, [groupKey]: group };
	}, {} as Record<TKey, T[]>);
}
