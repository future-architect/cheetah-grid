'use strict';

const InlineImage = require('./InlineImage');
const {isPromise} = require('../internal/utils');

function buildSvgDataUrl(svg) {
	if (isPromise(svg)) {
		return svg.then(buildSvgDataUrl);
	} else {
		const data = (typeof svg === 'string') ? svg : new XMLSerializer().serializeToString(svg);
		const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data); //svgデータをbase64に変換
		return url;
	}
}
function getSvgElement(svg) {
	if (isPromise(svg)) {
		return svg.then(getSvgElement);
	} else if (typeof svg === 'string') {
		const parser = new DOMParser();
		return parser.parseFromString(svg, 'image/svg+xml');
	} else {
		return svg;
	}
}

class InlineSvg extends InlineImage {
	constructor(
			{
				svg,
				width,
				height,
				imageLeft,
				imageTop,
				imageWidth,
				imageHeight,
			}) {
		const svgElem = getSvgElement(svg);
		const elmWidth = svgElem.getAttribute ? svgElem.getAttribute('width') : null;
		const elmHeight = svgElem.getAttribute ? svgElem.getAttribute('height') : null;
		super({
			src: buildSvgDataUrl(svg),
			width: width || elmWidth,
			height: height || elmHeight,
			imageWidth: elmWidth,
			imageHeight: elmHeight,
		});
	}
}

module.exports = InlineSvg;