const crypto = require('crypto');

class SynthesizerCacheService {
	constructor() {
		this.cache = new Map();
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
}

module.exports = new SynthesizerCacheService();
