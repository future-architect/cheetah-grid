//https://github.com/tsayen/dom-to-image/blob/master/src/dom-to-image.js
//を参考に作成
/*eslint-disable no-bitwise*/
'use strict';

const Loader = require('./Loader');
const xhr = require('./xhr');
const AllFontsLoader = require('./AllFontsLoader');
const Thenable = require('../Thenable');

function escape(string) {
	return string.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');
}


function parseExtension(url) {
	const match = /\.([^./]*?)$/g.exec(url);
	if (match) { return match[1]; } else { return ''; }
}
function mimes() {
	// Only WOFF and EOT mime types for fonts are 'real'
	// see http://www.iana.org/assignments/media-types/media-types.xhtml
	const WOFF = 'application/font-woff';
	const JPEG = 'image/jpeg';

	return {
		'woff': WOFF,
		'woff2': WOFF,
		'ttf': 'application/font-truetype',
		'eot': 'application/vnd.ms-fontobject',
		'png': 'image/png',
		'jpg': JPEG,
		'jpeg': JPEG,
		'gif': 'image/gif',
		'tiff': 'image/tiff',
		'svg': 'image/svg+xml'
	};
}
function dataAsUrl(content, type) {
	return `data:${type};base64,${content}`;
}

function mimeType(url) {
	const qIdx = url.indexOf('?');
	if (qIdx >= 0) {
		url = url.substr(0, qIdx);
	}
	const extension = parseExtension(url).toLowerCase();
	return mimes()[extension] || '';
}
function urlAsRegex(url) {
	return new RegExp(`(url\\(['"]?)(${escape(url)})(['"]?\\))`, 'g');
}

function replaceUrl(fontCss, srcUrl, dataUrl) {
	return fontCss.replace(urlAsRegex(srcUrl), `$1'${dataUrl}'$3`);
}

function buildDataUrl(data, srcUrl) {
	return dataAsUrl(data, mimeType(srcUrl));
}

//https://gist.github.com/viljamis/c4016ff88745a0846b94
function base64Encode(str) {
	const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	const len = str.length;
	let out = '',
		i = 0;
	while (i < len) {
		const c1 = str.charCodeAt(i++) & 0xff;
		if (i === len) {
			out += CHARS.charAt(c1 >> 2);
			out += CHARS.charAt((c1 & 0x3) << 4);
			out += '==';
			break;
		}
		const c2 = str.charCodeAt(i++);
		if (i === len) {
			out += CHARS.charAt(c1 >> 2);
			out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
			out += CHARS.charAt((c2 & 0xF) << 2);
			out += '=';
			break;
		}
		const c3 = str.charCodeAt(i++);
		out += CHARS.charAt(c1 >> 2);
		out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
		out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
		out += CHARS.charAt(c3 & 0x3F);
	}
	return out;
}

class FontsCssLoader extends Loader {
	constructor() {
		super((resolve) => {
			const xhrCache = {};
			new AllFontsLoader().then((fontFaces) => {
				let fontsCss = fontFaces.map((fontFace) => fontFace.css).
					join();
				const urls = Array.prototype.concat.apply([], fontFaces.map((fontFace) => fontFace.urls));
				return Thenable.all(urls.map((url) => xhr.getOnCacheOrHttp(url, xhrCache, 'text/plain; charset=x-user-defined'/*get binaly*/).
					then((responceText) => {
						const dataUrl = buildDataUrl(base64Encode(responceText), url);
						fontsCss = replaceUrl(fontsCss, url, dataUrl);
					})
				)).then(() => {
					resolve(fontsCss);
				});
			});
		});
	}
}

module.exports = FontsCssLoader;