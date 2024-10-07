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

	async speakText(text, onBoundary, onEnd, onError) {
		const selectedVoiceName = LocalDatabaseService.load('selectedVoice') || localBuildInVoice;
		const remoteVoice = remoteVoices.find(v => v.displayName === selectedVoiceName);
		if (remoteVoice) {
			await this.remoteSynthesiser.speakText(remoteVoice.actualName, text, this.language, onEnd, onError);
		} else {
			await this.localSynthesiser.speakText(text, onBoundary, onEnd, onError);
		}
	}

	async preloadText(text) {
		const selectedVoiceName = LocalDatabaseService.load('selectedVoice') || localBuildInVoice;
		const remoteVoice = remoteVoices.find(v => v.displayName === selectedVoiceName);
		if (remoteVoice) {
			await this.remoteSynthesiser.preloadText(remoteVoice.actualName, text, this.language);
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