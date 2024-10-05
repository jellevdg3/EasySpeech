import LocalDatabaseService from './LocalDatabaseService.js';

class SpeechSynthesisService {
	speakText(text, onBoundary, onEnd, onError) {
		if (speechSynthesis.speaking) {
			speechSynthesis.cancel();
		}
		const utterance = new SpeechSynthesisUtterance(text);
		const selectedVoiceName = LocalDatabaseService.load('selectedVoice') || 'Standaard - Build in';
		if (selectedVoiceName !== 'Standaard - Build in') {
			const voices = speechSynthesis.getVoices();
			const voice = voices.find(v => v.name === selectedVoiceName);
			if (voice) {
				utterance.voice = voice;
			}
			else {
				console.warn("Voice " + selectedVoiceName + " not found in available voices!");
			}
		}
		if (onBoundary) {
			utterance.onboundary = onBoundary;
		}
		utterance.onend = onEnd;
		utterance.onerror = onError;
		speechSynthesis.speak(utterance);
	}

	cancelSpeech() {
		if (speechSynthesis.speaking) {
			speechSynthesis.cancel();
		}
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

	getVoicesList() {
		const localVoices = speechSynthesis.getVoices().filter(v => v.lang === 'nl-NL').map(v => v.name);
		const additionalVoices = [
			'FennaNeural - Azure',
			'MaartenNeural - Azure',
			'ColetteNeural - Azure',
			'AlloyMultilingualNeural - OpenAI',
			'EchoMultilingualNeural - OpenAI',
			'FableMultilingualNeural - OpenAI',
			'OnyxMultilingualNeural - OpenAI',
			'NovaMultilingualNeural - OpenAI',
			'ShimmerMultilingualNeural - OpenAI'
		];
		return [...localVoices, ...additionalVoices];
	}
}

export default new SpeechSynthesisService();