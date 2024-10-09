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

		this.languageMap = {
			'Nederlands': 'nl-NL',
			'English': 'en-US',
			'Spanish': 'es-ES',
			'French': 'fr-FR',
			'German': 'de-DE',
			'Chinese': 'zh-CN',
			'Japanese': 'ja-JP',
			'Russian': 'ru-RU',
			'Italian': 'it-IT',
			'Portuguese': 'pt-PT'
		};
	}

	escapeXml(unsafe) {
		return unsafe.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&apos;");
	}

	getLanguageCode(languageName) {
		return this.languageMap[languageName];
	}

	async generateVoice(voice, text, language, speed = '0%') { // Default speed is normal
		const langCode = this.getLanguageCode(language);
		if (!langCode) {
			throw new Error(`Unsupported language: ${language}`);
		}

		return synthesizerCacheService.getOrSet(this.serviceName, voice, language, text, speed, async () => {
			console.log(langCode);
			const isMultilingualNeural = voice.includes('MultilingualNeural');
			const escapedText = this.escapeXml(text);
			let ssml = `
                <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${langCode}'>
                    <voice name='${voice}' xml:lang='${langCode}'>
                        <prosody rate='${speed}'>`;

			if (isMultilingualNeural) {
				ssml += `
							<lang xml:lang='${langCode}'>
                            	${escapedText}
							</lang>`;
			} else {
				ssml += `
                            	${escapedText}`;
			}

			ssml += `
                        </prosody>
                    </voice>
                </speak>`;

			console.log('Generate text:', text, 'with voice:', voice, 'language:', language, 'speed:', speed);
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
