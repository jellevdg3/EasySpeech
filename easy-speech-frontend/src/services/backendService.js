class backendService {
	async getSpeech(message, voiceName, language) {
		try {
			const response = await fetch('http://localhost:3000/getSpeech', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message,
					speechConfiguration: {
						voiceName,
						language
					}
				})
			});
			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Failed to get speech:', error);
			throw error;
		}
	}
}

module.exports = new backendService();
