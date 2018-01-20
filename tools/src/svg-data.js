/*eslint-disable no-sync*/
'use strict';

const jsdom = require('jsdom');


function findElement(el, test) {
	for (const child of el.children) {
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
		const document = new jsdom.JSDOM().window.document.createElement('div');
		document.innerHTML = svgCode;
		const svg = document.children[0];
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
			for (const child of el.children) {
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