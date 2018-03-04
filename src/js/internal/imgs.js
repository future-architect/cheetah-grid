'use strict';

const {then} = require('./utils');
const LRUCache = require('./LRUCache');

const allCache = {};

function isDataUrl(url) {
	return url.search(/^(data:)/) !== -1;
}

function loadImage(src) {
	if (!window.Promise) {
		console.error('Promise is not loaded. load Promise before this process.');
		return {
			then() {
				return this;
			}
		};
	}
	const img = new Image();
	const result = new window.Promise((resolve) => {
		img.onload = () => {
			resolve(img);
		};
	});
	img.onerror = (e) => {
		const url = src.length > 200 ? `${src.substr(0, 200)}...` : src;
		console.warn(`cannot load: ${url}`);
		throw new Error(`IMAGE LOAD ERROR: ${url}`);
	};
	img.src = isDataUrl(src) ? src : `${src}?${Date.now()}`;
	return result;
}

function getCacheOrLoad0(cache, src) {
	return then(src, (src) => {
		const c = cache.get(src);
		if (c) {
			return c;
		}
		const result = loadImage(src).then((img) => {
			cache.put(src, img);
			return img;
		});
		cache.put(src, result);
		return result;
	});
}

function getCacheOrLoad(cacheName, cacheSize, src) {
	const cache = allCache[cacheName] || (allCache[cacheName] = new LRUCache(cacheSize));
	return getCacheOrLoad0(cache, src);
}

module.exports = {
	loadImage,
	getCacheOrLoad,
};
