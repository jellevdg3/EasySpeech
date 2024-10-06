class RemoteSpeechSynthesiser {
	constructor() {
		this.audio = null;
		this.isPlaying = false;
	}

	async speakText(voiceName, text, onEnd, onError) {
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
			this.audio = new Audio(url);
			this.audio.onended = onEnd;
			this.audio.onerror = onError;
			this.audio.play();
			this.isPlaying = true;
		} catch (error) {
			onError(error);
		}
	}

	cancelSpeech() {
		if (this.audio && this.isPlaying) {
			this.audio.pause();
			this.audio.currentTime = 0;
			this.isPlaying = false;
		}
	}
}

export default RemoteSpeechSynthesiser;