const fetch = require('node-fetch');
require('dotenv').config();
const synthesizerCacheService = require('./synthesizerCacheService');

class azureSynthesizerService {
	constructor() {
		this.azureKey = process.env.AZURE_TTS_KEY;
		this.azureRegion = process.env.AZURE_REGION;
		if (!this.azureKey || !this.azureRegion) {
			throw new Error('Azure credentials are not set in the environment variables.');
		}
		this.ttsEndpoint = `https://${this.azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
		this.serviceName = 'AzureTTS';
	}

	escapeXml(unsafe) {
		return unsafe.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&apos;");
	}

	getLanguageFromVoice(voice) {
		const parts = voice.split('-');
		if (parts.length < 2) return null;
		return `${parts[0]}-${parts[1]}`;
	}

	async generateVoice(voice, text) {
		return synthesizerCacheService.getOrSet(this.serviceName, voice, text, async () => {
			const lang = this.getLanguageFromVoice(voice);
			if (!lang) {
				throw new Error('Invalid voice name format.');
			}
			const ssml = `
				<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lang}'>
					<voice name='${voice}'>
						${this.escapeXml(text)}
					</voice>
				</speak>`;
			console.log('Generate text:', text, 'with voice:', voice);
			const response = await fetch(this.ttsEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/ssml+xml',
					'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm',
					'Ocp-Apim-Subscription-Key': this.azureKey,
					'User-Agent': 'AzureTTSNodeJS/1.0'
				},
				body: ssml
			});
			if (!response.ok) {
				const errorDetails = await response.text();
				const error = new Error('Error from Azure TTS service.');
				error.status = response.status;
				error.details = errorDetails;
				throw error;
			}
			const audioBuffer = await response.buffer();
			return audioBuffer;
		});
	}
}

module.exports = new azureSynthesizerService();