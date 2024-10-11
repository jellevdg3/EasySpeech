export function stripFormatting(text) {
	return text
		.replace(/\*\*(.*?)\*\*/g, '$1')
		.replace(/\*(.*?)\*/g, '$1')
		.replace(/#{1,6}\s+(.*)/g, '$1')
		.replace(/`{1,3}(.*?)`{1,3}/g, '$1')
		.replace(/\[(.*?)\]\(.*?\)/g, '$1')
		.replace(/!\[.*?\]\(.*?\)/g, '')
		.trim();
}