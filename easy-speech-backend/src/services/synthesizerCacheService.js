const crypto = require('crypto');

class SynthesizerCacheService {
	constructor() {
		this.cache = new Map();
	}

	generateKey(serviceName, voice, text) {
		const hash = crypto.createHash('sha256');
		hash.update(serviceName + voice + text);
		return hash.digest('hex');
	}

	async getOrSet(serviceName, voice, text, generateFunction) {
		const key = this.generateKey(serviceName, voice, text);
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