require('dotenv').config();
const express = require('express');
const cors = require('cors');
const azureSynthesizerService = require('./services/azureSynthesizerService');

const app = express();

app.use(express.json());
app.use(cors());

app.post('/voices/generate', async (req, res) => {
	const { voice, text, language, speed } = req.body;

	if (!voice || !text || !language) {
		return res.status(400).json({ error: 'Missing "voice", "text", or "language" in request body.' });
	}

	try {
		const audioBuffer = await azureSynthesizerService.generateVoice(voice, text, language, speed ?? '0%');
		res.set({
			'Content-Type': 'audio/wav',
			'Content-Disposition': 'attachment; filename="speech.wav"'
		});
		res.send(audioBuffer);
	} catch (error) {
		if (error.status) {
			console.error('Status Code:', error.status);
			console.error('Azure TTS Error Details:', error.details);
			return res.status(error.status).json({ error: 'Error from Azure TTS service.', details: error.details });
		}
		console.error('Server Error:', error);
		res.status(500).json({ error: 'Internal server error.', details: error.message });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Azure TTS server is running on port ${PORT}`);
});
