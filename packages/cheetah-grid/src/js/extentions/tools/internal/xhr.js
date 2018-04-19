'use strict';


const Thenable = require('../Thenable');

function get(url, mimeType) {
	return new Thenable((resolve) => {
		console.log(`load: ${mimeType ? `mimeType:${mimeType} ` : ''}${url}`);
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		if (mimeType) {
			xhr.overrideMimeType(mimeType);
		}
		xhr.onload = function() {
			resolve(xhr.responseText);
		};
		xhr.send();
	});
}

function getOnCacheOrHttp(url, cache, mimeType) {
	return cache[url] || (cache[url] = get(url, mimeType));
}

module.exports = {
	get,
	getOnCacheOrHttp,
};