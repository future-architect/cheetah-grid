'use strict';

const InlineImage = require('./InlineImage');
const {then} = require('../internal/utils');

function buildSvgDataUrl(svg) {
	const data = (typeof svg === 'string') ? svg : new XMLSerializer().serializeToString(svg);
	const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`; //svgデータをbase64に変換
	return url;
}
function getSvgElement(svg) {
	if (typeof svg === 'string') {
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
		const svgElem = then(svg, getSvgElement);
		const elmWidth = svgElem.getAttribute ? svgElem.getAttribute('width') : null;
		const elmHeight = svgElem.getAttribute ? svgElem.getAttribute('height') : null;
		super({
			src: then(svg, buildSvgDataUrl),
			width: width || elmWidth,
			height: height || elmHeight,
			imageWidth: elmWidth,
			imageHeight: elmHeight,
		});
	}
}

module.exports = InlineSvg;