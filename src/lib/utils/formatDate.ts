export function formatDateTime(
	date: Date,
	options: Intl.DateTimeFormatOptions,
) {
	return new Intl.DateTimeFormat("ru-RU", options).format(date);
}
