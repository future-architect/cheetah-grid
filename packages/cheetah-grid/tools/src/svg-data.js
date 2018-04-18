/*eslint-disable no-sync*/
'use strict';

const {DOMParser} = (() => {
	if (typeof window !== 'undefined') {
		return {
			DOMParser: window.DOMParser
		};
	}
	return require('xmldom');
})();
const parser = new DOMParser();
const ELEMENT_NODE = 1;

function findElement(el, test) {
	const {childNodes} = el;
	for (let i = 0; i < childNodes.length; i++) {
		const child = childNodes[i];
		if (child.nodeType !== ELEMENT_NODE) {
			continue;
		}
		if (test(child)) {
			return child;
		}
		const r = findElement(child, test);
		if (r) {
			return r;
		}
	}
	return null;
}

class Svg {
	constructor(svgCode) {
		const document = parser.parseFromString(svgCode, 'image/svg+xml');

		// new jsdom.JSDOM().window.document.createElement('div');
		// document.innerHTML = svgCode;
		const svg = document.documentElement;
		this.svg = svg;
		this._glyphs = {};
		this._glyphUnis = {};
	}
	findElement(test) {
		return findElement(this.svg, test);
	}
	get fontFaceElement() {
		if (!this._fontFace) {
			this._fontFace = this.findElement((child) => child.tagName.toLowerCase() === 'font-face');
		}
		return this._fontFace;
	}
	get fontElement() {
		if (!this._font) {
			this._font = this.findElement((child) => child.tagName.toLowerCase() === 'font');
		}
		return this._font;
	}
	findGlyph(glyphName) {
		return this._glyphs[glyphName] || (this._glyphs[glyphName] = this.findElement((child) => child.getAttribute('glyph-name') === glyphName));
	}
	findGlyphByUnicode(unicode) {
		return this._glyphUnis[unicode] || (this._glyphUnis[unicode] = this.findElement((child) => child.getAttribute('unicode') === unicode));
	}
	walkAllGlyph(callback) {
		const walkGlyph = (el) => {
			const {childNodes} = el;
			for (let i = 0; i < childNodes.length; i++) {
				const child = childNodes[i];
				if (child.nodeType !== ELEMENT_NODE) {
					continue;
				}
				const unicode = child.getAttribute('unicode');
				if (unicode && child.getAttribute('d')) {
					if (!this._glyphUnis[unicode]) {
						this._glyphUnis[unicode] = child;
					}
					const glyphName = child.getAttribute('glyph-name');
					if (glyphName && !this._glyphs[glyphName]) {
						this._glyphs[glyphName] = child;
					}
					callback(child);
				} else {
					walkGlyph(child);
				}
			}
		};
		walkGlyph(this.svg);
	}
}

const cache = {};

module.exports = {
	get(svgCode) {
		const svg = cache[`font:${svgCode}`] || (cache[`font:${svgCode}`] = new Svg(svgCode));
		return svg;
	}
};