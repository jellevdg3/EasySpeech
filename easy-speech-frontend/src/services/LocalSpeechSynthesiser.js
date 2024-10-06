import LocalDatabaseService from './LocalDatabaseService.js';

class LocalSpeechSynthesiser {
	constructor() {
		this.voices = [];
		this.voicesLoaded = false;
		this.loadVoicesPromise = this.loadVoices();
	}

	loadVoices() {
		return new Promise((resolve) => {
			let voices = speechSynthesis.getVoices();
			if (voices.length > 0) {
				this.voices = voices;
				this.voicesLoaded = true;
				resolve(this.voices);
			} else {
				speechSynthesis.addEventListener('voiceschanged', () => {
					this.voices = speechSynthesis.getVoices();
					this.voicesLoaded = true;
					resolve(this.voices);
				});
			}
		});
	}

	async getVoicesList() {
		if (!this.voicesLoaded) {
			await this.loadVoicesPromise;
		}
		const localVoices = this.voices.filter(v => v.lang === 'nl-NL').map(v => v.name);
		return localVoices;
	}

	async speakText(text, onBoundary, onEnd, onError) {
		if (speechSynthesis.speaking) {
			speechSynthesis.cancel();
		}
		const utterance = new SpeechSynthesisUtterance(text);
		const selectedVoiceName = LocalDatabaseService.load('selectedVoice') || 'Local - Build in';
		const voice = this.voices.find(v => v.name === selectedVoiceName);
		if (voice) {
			utterance.voice = voice;
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
}

export default LocalSpeechSynthesiser;