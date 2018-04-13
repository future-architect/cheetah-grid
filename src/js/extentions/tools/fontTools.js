
'use strict';


const icons = require('../../internal/icons');
const LRUCache = require('../../internal/LRUCache');
const FontsCssLoader = require('./internal/FontsCssLoader');
const Thenable = require('./Thenable');
const Loader = require('./internal/Loader');

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';

class SvgInfo {
	constructor({font, content, color}) {
		this.font = font;
		this.content = content;
		this.color = color;
	}
	setBBox(bbox) {
		this.width = bbox.width;
		this.height = bbox.height;
	}
	buildSvg(css = '') {
		const svg = document.createElementNS(SVG_NAMESPACE_URI, 'svg');
		const defs = document.createElementNS(SVG_NAMESPACE_URI, 'defs');
		svg.appendChild(defs);
		const style = document.createElementNS(SVG_NAMESPACE_URI, 'style');
		style.setAttribute('type', 'text/css');
		defs.appendChild(style);

		const text = document.createElementNS(SVG_NAMESPACE_URI, 'text');
		svg.appendChild(text);
		text.textContent = this.content;
		style.textContent = css;

		if (this.width && this.height) {
			svg.setAttribute('width', this.width);
			svg.setAttribute('height', this.height);
			svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);

			// for IE
			text.setAttribute('y', this.height);
		}

		if (this.font) {
			text.setAttribute('style', `font-feature-settings: 'liga';font: ${this.font};`);
		}
		text.setAttribute('text-anchor', 'start');
		text.setAttribute('dominant-baseline', 'text-after-edge');

		return svg;
	}
	calcBBox(css) {
		const svg = this.buildSvg(css);
		svg.style.display = 'block';
		svg.style.position = 'absolute';
		svg.style.top = '-9999px';
		svg.style.left = '-9999px';
		const text = svg.querySelector('text');

		document.body.appendChild(svg);//

		text.setAttribute('style', `font-feature-settings:'liga' 0;font: ${this.font};`);
		const before1 = svg.getBBox();

		text.setAttribute('style', `font-feature-settings:'liga' 1;font: ${this.font};`);
		const before2 = svg.getBBox();

		return new Thenable((resolve) => {
			if (before1.width !== before2.width) {
				resolve();
				return;
			}

			const timeout = Date.now() + 800;

			function watch() {
				const bbox = svg.getBBox();
				if (bbox.width === before2.width) {
					if (timeout < Date.now()) {
						console.log('timeout');
						resolve();
					} else {
						setTimeout(watch, 50);
					}
				} else {
					resolve();
				}
			}

			watch();
		}).then(() => {
			const bbox = svg.getBBox();
			this.setBBox(bbox);

			document.body.removeChild(svg);
		});
	}
}


const svgInfoCache = new LRUCache(50);
let fontsCssLoader;

function getSvgInfo({font, content, color}) {
	const key = `${font}@${content} color=${color}`;
	let infoThenable = svgInfoCache.get(key);
	if (infoThenable) {
		return infoThenable;
	}

	fontsCssLoader = fontsCssLoader || (new FontsCssLoader());
	return (infoThenable = fontsCssLoader.then((css) => {
		const info = new SvgInfo({font, content, color});
		return info.calcBBox(css).then(() => {
			svgInfoCache.put(key, infoThenable);
			return info;
		});
	}));
}


function fontToSvg({font, content, color}) {
	return getSvgInfo({font, content, color}).then((info) => {
		const svg = info.buildSvg(fontsCssLoader.get());
		return svg;
	});
}

function toPromiseOrData(callback, thenable) {
	const loader = Loader.thenableOf(thenable);
	if (callback) {
		loader.then(callback);
	}
	const data = loader.get();
	if (data) {
		return data;
	}
	if (window.Promise) {
		return new window.Promise((resolve) => {
			loader.then(resolve);
		});
	} else {
		//置き換える。保証はしない
		console.warn('Promise is not loaded. load Promise before this process.');
		console.info('Tentatively set Promise. It does not guarantee the operation of Promise.');
		window.Promise = Thenable;
		return thenable;
	}

}

module.exports = {
	fontContentToSvg(fontData, callback) {
		if (Array.isArray(fontData.content)) {
			return fontData.content.map((c) => {
				fontData.content = c;
				return toPromiseOrData(callback, fontToSvg(fontData));
			});
		} else {
			return toPromiseOrData(callback, fontToSvg(fontData));
		}
	},
	classNameToFont(className, tagName) {
		return icons.getIconProps(tagName, className);
	},
};