const crypto = require('crypto');
const cron = require('node-cron');

class SynthesizerCacheService {
	constructor() {
		this.cache = new Map();

		// Schedule cache clearing at 3:16 PM Netherlands time
		cron.schedule('0 3 * * *', () => {
			this.clearCache();
			console.log('Synthesizer cache cleared at 03:00 AM Netherlands time.');
		}, {
			timezone: 'Europe/Amsterdam' // Timezone set to Netherlands
		});
	}

	generateKey(serviceName, voice, language, text, speed) {
		const hash = crypto.createHash('sha256');
		hash.update(serviceName + voice + language + text + speed);
		return hash.digest('hex');
	}

	async getOrSet(serviceName, voice, language, text, speed, generateFunction) {
		const key = this.generateKey(serviceName, voice, language, text, speed);
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}
		const promise = generateFunction().then(result => {
			this.cache.set(key, result);
			return result;
		}).catch(err => {
			this.cache.delete(key);
			throw err;
		});
		this.cache.set(key, promise);
		return promise;
	}

	clearCache() {
		this.cache.clear();
	}
}

module.exports = new SynthesizerCacheService();
