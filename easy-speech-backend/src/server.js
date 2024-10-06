require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Function to escape XML special characters
function escapeXml(unsafe) {
	return unsafe.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

// Function to extract language from voice name
function getLanguageFromVoice(voice) {
	const parts = voice.split('-');
	if (parts.length < 2) return null;
	return `${parts[0]}-${parts[1]}`;
}

let availableVoices = [];

// Function to fetch available voices from Azure
async function fetchAvailableVoices() {
	const azureKey = process.env.AZURE_TTS_KEY;
	const azureRegion = process.env.AZURE_REGION;

	if (!azureKey || !azureRegion) {
		console.error('Azure credentials are not set in the environment variables.');
		return;
	}

	const voicesEndpoint = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`;

	try {
		const response = await fetch(voicesEndpoint, {
			method: 'GET',
			headers: {
				'Ocp-Apim-Subscription-Key': azureKey,
				'User-Agent': 'AzureTTSNodeJS/1.0'
			}
		});

		if (!response.ok) {
			const errorDetails = await response.text();
			console.error('Failed to fetch voices. Status Code:', response.status);
			console.error('Azure TTS Error Details:', errorDetails);
			return;
		}

		const voices = await response.json();
		availableVoices = voices;
		console.log(`Fetched ${voices.length} voices from Azure TTS.`);

		fs.writeFile('voices.json', JSON.stringify(voices, null, 2), (err) => {
			if (err) {
				console.error('Error writing voices to file:', err);
			} else {
				console.log('Available voices have been written to voices.json');
			}
		});

	} catch (error) {
		console.error('Error fetching voices from Azure TTS:', error);
	}
}

// Endpoint to list available voices
app.get('/voices', (req, res) => {
	res.json(availableVoices);
});

// Endpoint to handle text-to-speech requests
app.post('/voices/generate', async (req, res) => {
	const { voice, text } = req.body;

	console.log('Received /voices/generate request with body:', req.body);

	if (!voice || !text) {
		console.warn('Missing "voice" or "text" in request body.');
		return res.status(400).json({ error: 'Missing "voice" or "text" in request body.' });
	}

	const azureKey = process.env.AZURE_TTS_KEY;
	const azureRegion = process.env.AZURE_REGION;

	if (!azureKey || !azureRegion) {
		console.error('Azure credentials are not set in the environment variables.');
		return res.status(500).json({ error: 'Azure credentials are not set in the environment variables.' });
	}

	const ttsEndpoint = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

	const lang = getLanguageFromVoice(voice);

	if (!lang) {
		console.warn('Unable to extract language from the voice name.');
		return res.status(400).json({ error: 'Invalid voice name format.' });
	}

	// Construct SSML (Speech Synthesis Markup Language) with escaped text
	const ssml = `
    <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lang}'>
        <voice name='${voice}'>
            ${escapeXml(text)}
        </voice>
    </speak>`;

	try {
		const response = await fetch(ttsEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/ssml+xml',
				'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm',
				'Ocp-Apim-Subscription-Key': azureKey,
				'User-Agent': 'AzureTTSNodeJS/1.0'
			},
			body: ssml
		});

		if (!response.ok) {
			const errorDetails = await response.text();
			console.error('Status Code:', response.status);
			console.error('Response Headers:', JSON.stringify(response.headers.raw()));
			console.error('Azure TTS Error Details:', errorDetails);
			return res.status(response.status).json({ error: 'Error from Azure TTS service.', details: errorDetails });
		}

		const audioBuffer = await response.buffer();
		// Set headers to indicate a WAV file is being sent
		res.set({
			'Content-Type': 'audio/wav',
			'Content-Disposition': 'attachment; filename="speech.wav"'
		});

		res.send(audioBuffer);
	} catch (error) {
		console.error('Server Error:', error);
		res.status(500).json({ error: 'Internal server error.', details: error.message });
	}
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
	console.log(`Azure TTS server is running on port ${PORT}`);
});
