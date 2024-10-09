class RemoteSpeechSynthesiser {
	constructor() {
		this.audio = null;
		this.isPlaying = false;
		this.audioCache = new Map();
	}

	async preloadText(voiceName, text, language, speed) { // Added speed parameter
		const cacheKey = `${voiceName}:${language}:${text}:speed=${speed}%`;
		if (this.audioCache.has(cacheKey)) {
			return;
		}
		try {
			const response = await fetch(process.env.VUE_APP_API_URL, { // Updated URL
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					voice: voiceName,
					text,
					language,
					speed: `${speed}%` // Include speed in request body
				})
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

	async speakText(voiceName, text, language, speed, onEnd, onError) { // Added speed parameter
		const cacheKey = `${voiceName}:${language}:${text}:speed=${speed}%`;
		let audio = this.audioCache.get(cacheKey);
		if (!audio) {
			try {
				await this.preloadText(voiceName, text, language, speed);
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
		audio.play().then(() => {
			this.isPlaying = true;
		}).catch(onError);
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
		this.audioCache.forEach((audio) => {
			URL.revokeObjectURL(audio.src);
		});
		this.audioCache.clear();
	}
}

export default RemoteSpeechSynthesiser;