//https://github.com/tsayen/dom-to-image/blob/master/src/dom-to-image.js
//を参考に作成
'use strict';
const Loader = require('./Loader');
const xhr = require('./xhr');
const Thenable = require('../Thenable');


const URL_REGEX = /url\(['"]?([^'"]+?)['"]?\)/g;
const FONTFACE_REGEX = /(@font-face\s*\{[\s\S]*\})/g;

function isDataUrl(url) {
	return url.search(/^(data:)/) !== -1;
}
function isFileUrl(url) {
	return url.search(/^(file:)/) !== -1;
}
function readFontFaces(css) {
	const result = [];
	let match;
	while ((match = FONTFACE_REGEX.exec(css)) !== null) {
		result.push(match[1]);
	}
	return result;
}
function readUrls(fontCss) {
	const result = [];
	let match;
	while ((match = URL_REGEX.exec(fontCss)) !== null) {
		const url = match[1];
		if (!isDataUrl(url)) {
			result.push(match[1]);
		}
	}
	return result;
}

function resolveUrl(url, baseUrl) {
	const doc = document.implementation.createHTMLDocument('dummy');
	const base = doc.createElement('base');
	doc.head.appendChild(base);
	const a = doc.createElement('a');
	doc.body.appendChild(a);
	base.href = baseUrl;
	a.href = url;
	return a.href;
}

function getCssRules(styleSheet) {
	try {
		return styleSheet.cssRules;
	} catch (e) {
		if (e.name !== 'SecurityError') {
			throw e;
		}
		return undefined;
	}
}
function toArray(arr) {
	return Array.prototype.slice.call(arr);
}
function getFontUrls(css, cssUrl) {
	return readUrls(css).
		map((srcUrl) => resolveUrl(srcUrl, cssUrl)).
		filter((url) => !isFileUrl(url));
}
function getFontFaceInfoFromFontFaceRule(cssRule, styleSheet) {
	const cssUrl = styleSheet.href;
	const src = cssRule.style.getPropertyValue('src') || cssRule.cssText;
	return {
		urls: getFontUrls(src, cssUrl),
		css: cssRule.cssText
	};
}
function getFontFaceInfosFromStyleSheet(styleSheet, xhrCache) {
	const cssUrl = styleSheet.href;
	if (isFileUrl(cssUrl)) {
		return [];
	}
	return xhr.getOnCacheOrHttp(cssUrl, xhrCache).
		then((text) => readFontFaces(text)).
		then((fontFaces) => fontFaces.map((fontFaceCss) => ({
			urls: getFontUrls(fontFaceCss, cssUrl),
			css: fontFaceCss
		})));
}
function getAllFontFaceInfos() {
	const xhrCache = {};
	const result = toArray(document.styleSheets).
		map((styleSheet) => {
			const cssRules = getCssRules(styleSheet);
			if (cssRules) {
				return toArray(cssRules).
					filter((cssRule) => cssRule.type === CSSRule.FONT_FACE_RULE).
					map((cssRule) => getFontFaceInfoFromFontFaceRule(cssRule, styleSheet));
			} else if (styleSheet.href) {
				return getFontFaceInfosFromStyleSheet(styleSheet, xhrCache);
			}
			return [];
		});
	return Thenable.all(result).then((rets) => Array.prototype.concat.apply([], rets)
	);
}

class AllFontsLoader extends Loader {
	constructor() {
		super((resolve) => {
			getAllFontFaceInfos().then(resolve);
		});
	}
}

module.exports = AllFontsLoader;