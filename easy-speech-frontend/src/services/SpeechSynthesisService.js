import LocalSpeechSynthesiser from './LocalSpeechSynthesiser.js';
import RemoteSpeechSynthesiser from './RemoteSpeechSynthesiser.js';
import LocalDatabaseService from './LocalDatabaseService.js';

const localBuildInVoice = "Local - Build in";
const remoteVoices = [
	{ displayName: 'Fenna - Azure', actualName: 'nl-NL-FennaNeural' },
	{ displayName: 'Maarten - Azure', actualName: 'nl-NL-MaartenNeural' },
	{ displayName: 'Colette - Azure', actualName: 'nl-NL-ColetteNeural' },
	{ displayName: 'Alloy - OpenAI', actualName: 'en-US-AlloyTurboMultilingualNeural' },
	{ displayName: 'Echo - OpenAI', actualName: 'en-US-EchoTurboMultilingualNeural' },
	{ displayName: 'Fable - OpenAI', actualName: 'en-US-FableTurboMultilingualNeural' },
	{ displayName: 'Onyx - OpenAI', actualName: 'en-US-OnyxTurboMultilingualNeural' },
	{ displayName: 'Nova - OpenAI', actualName: 'en-US-NovaTurboMultilingualNeural' },
	{ displayName: 'Shimmer - OpenAI', actualName: 'en-US-ShimmerTurboMultilingualNeural' }
];

class SpeechSynthesisService {
	constructor() {
		this.localSynthesiser = new LocalSpeechSynthesiser();
		this.remoteSynthesiser = new RemoteSpeechSynthesiser();
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
			await this.remoteSynthesiser.speakText(remoteVoice.actualName, text, onEnd, onError);
		} else {
			await this.localSynthesiser.speakText(text, onBoundary, onEnd, onError);
		}
	}

	cancelSpeech() {
		this.localSynthesiser.cancelSpeech();
		this.remoteSynthesiser.cancelSpeech();
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