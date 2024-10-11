import LZString from 'lz-string';

class LocalDatabaseService {
	load(key) {
		const value = localStorage.getItem(key);
		return value ? JSON.parse(value) : null;
	}

	save(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	remove(key) {
		localStorage.removeItem(key);
	}

	loadCompressed(key) {
		const compressed = localStorage.getItem(key);
		return compressed ? JSON.parse(LZString.decompress(compressed)) : null;
	}

	saveCompressed(key, value) {
		const compressed = LZString.compress(JSON.stringify(value));
		localStorage.setItem(key, compressed);
	}
}

export default new LocalDatabaseService();