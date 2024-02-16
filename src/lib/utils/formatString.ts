export function formatString(str: string) {
	return str
		.replaceAll('\\"', '"')
		.replaceAll(`\\'`, `'`)
		.replaceAll("\\`", "`")
		.replaceAll("\\|", "|");
}
