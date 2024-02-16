export function formatPrice(args: { currency: string; amount: number }) {
	return new Intl.NumberFormat("ru-RU", {
		currency: args.currency,
		style: "currency",
		maximumFractionDigits: 0,
	}).format(args.amount);
}
