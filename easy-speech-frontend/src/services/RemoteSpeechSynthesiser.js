class RemoteSpeechSynthesiser {
	constructor() {
		this.audio = null;
		this.isPlaying = false;
		this.audioCache = new Map();
	}

	async preloadText(voiceName, text) {
		const cacheKey = `${voiceName}:${text}`;
		if (this.audioCache.has(cacheKey)) {
			return;
		}
		try {
			const response = await fetch('http://localhost:3000/voices/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ voice: voiceName, text })
			});
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const audio = new Audio(url);
			this.audioCache.set(cacheKey, audio);
		} catch (error) {
			console.error('Error preloading text:', error);
		}
	}

	async speakText(voiceName, text, onEnd, onError) {
		const cacheKey = `${voiceName}:${text}`;
		let audio = this.audioCache.get(cacheKey);
		if (!audio) {
			try {
				await this.preloadText(voiceName, text);
				audio = this.audioCache.get(cacheKey);
			} catch (error) {
				onError(error);
				return;
			}
		}
		if (!audio) {
			onError(new Error('Failed to load audio'));
			return;
		}
		if (this.audio && this.isPlaying) {
			this.audio.pause();
			this.audio.currentTime = 0;
			this.isPlaying = false;
		}
		this.audio = audio;
		this.audio.onended = onEnd;
		this.audio.onerror = onError;
		this.audio.play();
		this.isPlaying = true;
	}

	cancelSpeech() {
		if (this.audio && this.isPlaying) {
			this.audio.pause();
			this.audio.currentTime = 0;
			this.isPlaying = false;
		}
		this.audio = null;
	}

	clearCache() {
		this.audioCache.forEach((audio) => {
			audio.pause();
			audio.currentTime = 0;
		});
		this.audioCache.clear();
	}
}

export default RemoteSpeechSynthesiser;