import LocalSpeechSynthesiser from './LocalSpeechSynthesiser.js';
import RemoteSpeechSynthesiser from './RemoteSpeechSynthesiser.js';
import LocalDatabaseService from './LocalDatabaseService.js';

const localBuildInVoice = "Local - Build in";
const remoteVoices = [
	{ displayName: 'Fenna (NL) - Azure', actualName: 'nl-NL-FennaNeural' },
	{ displayName: 'Maarten (NL) - Azure', actualName: 'nl-NL-MaartenNeural' },
	{ displayName: 'Colette (NL) - Azure', actualName: 'nl-NL-ColetteNeural' },
	{ displayName: 'Ava - Azure', actualName: 'en-US-AvaMultilingualNeural' },
	{ displayName: 'Andrew - Azure', actualName: 'en-US-AndrewMultilingualNeural' },
	{ displayName: 'Emma - Azure', actualName: 'en-US-EmmaMultilingualNeural' },
	{ displayName: 'Brian - Azure', actualName: 'en-US-BrianMultilingualNeural' },
	{ displayName: 'Jenny - Azure', actualName: 'en-US-JennyMultilingualNeural' },
	{ displayName: 'Ryan - Azure', actualName: 'en-US-RyanMultilingualNeural' },
	{ displayName: 'Adam - Azure', actualName: 'en-US-AdamMultilingualNeural' },
	{ displayName: 'Amanda - Azure', actualName: 'en-US-AmandaMultilingualNeural' },
	{ displayName: 'Brandon - Azure', actualName: 'en-US-BrandonMultilingualNeural' },
	{ displayName: 'Christopher - Azure', actualName: 'en-US-ChristopherMultilingualNeural' },
	{ displayName: 'Cora - Azure', actualName: 'en-US-CoraMultilingualNeural' },
	{ displayName: 'Davis - Azure', actualName: 'en-US-DavisMultilingualNeural' },
	{ displayName: 'Derek - Azure', actualName: 'en-US-DerekMultilingualNeural' },
	{ displayName: 'Alloy - OpenAI', actualName: 'en-US-AlloyTurboMultilingualNeural' },
	{ displayName: 'Nova - OpenAI', actualName: 'en-US-NovaTurboMultilingualNeural' },
];

class SpeechSynthesisService {
	constructor() {
		this.localSynthesiser = new LocalSpeechSynthesiser();
		this.remoteSynthesiser = new RemoteSpeechSynthesiser();
		this.language = 'Nederlands'; // Default language
	}

	setLanguage(language) {
		this.language = language;
	}

	async getVoicesList() {
		const localVoices = await this.localSynthesiser.getVoicesList();
		const remoteDisplayNames = remoteVoices.map(v => v.displayName);
		return [...localVoices, ...remoteDisplayNames];
	}

	/**
	 * Strips markdown-like formatting from the text.
	 * Removes **bold**, *italic*, and other similar markers.
	 * @param {string} text - The formatted text.
	 * @returns {string} - The plain text without formatting.
	 */
	stripFormatting(text) {
		return text
			.replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
			.replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
			.replace(/#{1,6}\s+(.*)/g, '$1') // Remove Markdown headings
			.replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove inline code
			.replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links
			.replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images
			.trim();
	}

	async speakText(text, onBoundary, onEnd, onError) {
		const plainText = this.stripFormatting(text);
		const selectedVoiceName = LocalDatabaseService.load('selectedVoice') || localBuildInVoice;
		const selectedSpeed = LocalDatabaseService.load('selectedSpeed') || 0; // Load speed
		const remoteVoice = remoteVoices.find(v => v.displayName === selectedVoiceName);
		if (remoteVoice) {
			await this.remoteSynthesiser.speakText(remoteVoice.actualName, plainText, this.language, selectedSpeed, onEnd, onError);
		} else {
			await this.localSynthesiser.speakText(plainText, onBoundary, onEnd, onError, selectedSpeed);
		}
	}

	async preloadText(text) {
		const plainText = this.stripFormatting(text);
		const selectedVoiceName = LocalDatabaseService.load('selectedVoice') || localBuildInVoice;
		const selectedSpeed = LocalDatabaseService.load('selectedSpeed') || 0; // Load speed
		const remoteVoice = remoteVoices.find(v => v.displayName === selectedVoiceName);
		if (remoteVoice) {
			await this.remoteSynthesiser.preloadText(remoteVoice.actualName, plainText, this.language, selectedSpeed);
		}
	}

	cancelSpeech() {
		this.localSynthesiser.cancelSpeech();
		this.remoteSynthesiser.cancelSpeech();
	}

	clearCache() {
		this.remoteSynthesiser.clearCache();
	}

	splitIntoParts(text) {
		const lines = text.split('\n');
		let partsResult = [];
		let charIndex = 0;
		let sentenceIdx = 0;
		const sentences = [];

		lines.forEach((line, lineIdx) => {
			const sentencesInLine = line.match(/[^.!?]+[.!?]*\s*/g) || [];
			sentencesInLine.forEach((sentence) => {
				if (sentence) {
					const hasTrailingSpace = sentence.endsWith(' ');
					const trimmedSentence = hasTrailingSpace ? sentence.trimEnd() : sentence;
					partsResult.push({ type: 'sentence', text: trimmedSentence, index: sentenceIdx, start: charIndex, end: charIndex + trimmedSentence.length });
					sentences.push(trimmedSentence);
					charIndex += sentence.length;
					sentenceIdx++;
					if (hasTrailingSpace) {
						partsResult.push({ type: 'space' });
						charIndex += 1;
					}
				}
			});
			if (lineIdx < lines.length - 1) {
				partsResult.push({ type: 'newline' });
				charIndex += 1;
			}
		});

		return { parts: partsResult, sentences };
	}
}

export default new SpeechSynthesisService();