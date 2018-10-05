/*eslint-disable no-sync*/
'use strict';

const svgData = require('./svg-data');
const ELEMENT_NODE = 1;

function polygonToPath(polygon) {
	const points = polygon.getAttribute('points');
	return `M${points}z`;
}

function polylineToPath(polyline) {
	const points = polyline.getAttribute('points');
	return `M${points}`;
}

function circleToPath(circle) {
	const cx = circle.getAttribute('cx') - 0;
	const cy = circle.getAttribute('cy') - 0;
	const r = circle.getAttribute('r') - 0;

	//https://tyru.github.io/svg-circle-misc-algorithm/
	const SEGMENTS = 8;
	const ANGLE = 2 * Math.PI / SEGMENTS;
	const anchorX = (theta) => r * Math.cos(theta);
	const anchorY = (theta) => r * Math.sin(theta);
	const controlX = (theta) => anchorX(theta) + r * Math.tan(ANGLE / 2) * Math.cos(theta - Math.PI / 2);
	const controlY = (theta) => anchorY(theta) + r * Math.tan(ANGLE / 2) * Math.sin(theta - Math.PI / 2);

	let paths = `M${cx + r} ${cy}`;
	for (let index = 1; index <= SEGMENTS; index++) {
		const theta = index * ANGLE;
		paths += `Q${controlX(theta) + cx} ${controlY(theta) + cy} ${anchorX(theta) + cx} ${anchorY(theta) + cy}`;
	}
	return paths;
}

function rectToPath(rect) {
	const x = rect.getAttribute('x') - 0;
	const y = rect.getAttribute('y') - 0;
	const width = rect.getAttribute('width') - 0;
	const height = rect.getAttribute('height') - 0;
	return `M${x},${y} h${width} v${height} h${-width}z`;
}


function getD(path) {
	const fill = path.getAttribute('fill');
	if (fill === 'none') {
		return '';
	}
	return path.getAttribute('d').replace(/[\n\r]/g, '');
}

function elementToPaths(el, resource) {

	switch (el.tagName.toLowerCase()) {
	case 'path':
	case 'glyph':
		return getD(el);
	case 'circle':
		return circleToPath(el);
	case 'polygon':
		return polygonToPath(el);
	case 'polyline':
		return polylineToPath(el);
	case 'rect':
		return rectToPath(el);
	case 'g':
		let path = '';
		const {childNodes} = el;
		for (let i = 0; i < childNodes.length; i++) {
			const child = childNodes[i];
			if (child.nodeType !== ELEMENT_NODE) {
				continue;
			}
			if (!child.getAttribute('fill')) {
				child.setAttribute('fill', el.getAttribute('fill'));
			}
			path += elementToPaths(child, resource);
		}
		return path;
	default:
		console.warn(`unsupported:${el.tagName}`, `@ ${resource}\n${el.innerHTML}`);
	}
	return '';
}

function buildScript({
	offsetX = 0,
	offsetY = 0,
	width,
	height,
	d,
	isGlyph,
	html,
	resource,
}) {
	let flgs = '';
	if (isGlyph) {
		flgs += `ud: 1,
	`;
	}
	if (offsetX !== 0) {
		flgs += `x: ${offsetX},
	`;
	}
	if (offsetY !== 0) {
		flgs += `y: ${offsetY},
	`;
	}
	return `{
	/*
	original svg
	${html}
	@ ${resource}
	*/
	d: '${d}',
	width: ${width},
	height: ${height},
	${flgs}
}`;
}

function glyphToJSON(svgString, {
	glyphName,
	unicode,
}, resource) {

	const svg = svgData.get(svgString);
	function findGlyph() {
		if (glyphName) {
			return svg.findGlyph(glyphName);
		} else {
			return svg.findGlyphByUnicode(unicode);
		}

	}
	const fontFace = svg.fontFaceElement || {getAttribute() {}};
	const font = svg.fontElement || {getAttribute() {}};
	const glyph = findGlyph();
	//左下隅の x座標値，同y座標値，右上隅のx座標値，同y座標値
	// const bbox = (fontFace.getAttribute('bbox') || '').split(' ');
	// bbox.st = {
	// 	x: bbox[0] - 0,
	// 	y: bbox[1] - 0,
	// };
	// bbox.ed = {
	// 	x: bbox[2] - 0,
	// 	y: bbox[3] - 0,
	// };

	const fontHorizAdvX = (font.getAttribute('horiz-adv-x') - 0) || 0;
	const fontVertAdvX = (font.getAttribute('vert-adv-x') - 0) || 0;
	const horizAdvX = (glyph.getAttribute('horiz-adv-x') - 0) || fontHorizAdvX || 0;
	const vertAdvX = (glyph.getAttribute('vert-adv-x') - 0) || fontVertAdvX || 0;

	const unitsPerEm = (fontFace.getAttribute('units-per-em') - 0) || 1000;
	// const ascent = (fontFace.getAttribute('ascent') - 0) || (unitsPerEm - vertAdvX);
	const descent = (fontFace.getAttribute('descent') - 0) || vertAdvX;

	let size = unitsPerEm;
	const contentSize = {
		width: horizAdvX || unitsPerEm,
		height: vertAdvX || unitsPerEm,
	};
	if (horizAdvX > size) {
		size = horizAdvX;
	}
	if (vertAdvX > size) {
		size = vertAdvX;
	}

	let offsetX = 0;//-bbox.st.x || 0;
	let offsetY = -descent;
	offsetX += Math.round((size - contentSize.width) / 2);
	offsetY += Math.round((size - contentSize.height) / 2);

	const d = elementToPaths(glyph, resource);

	return buildScript({
		offsetX,
		offsetY,
		width: size,
		height: size,
		d,
		isGlyph: true,
		html: glyph.outerHTML,
		resource,
	});
}

function svgToJSON(svgString, resource) {
	const {svg} = svgData.get(svgString);
	const viewBox = (svg.getAttribute('viewBox') || '').split(' ');
	const width = ((svg.getAttribute('width') || viewBox[2]) - 0) || 0;
	const height = ((svg.getAttribute('height') || viewBox[3]) - 0) || 0;
	const offsetX = (0 - viewBox[0]) || 0;
	const offsetY = (0 - viewBox[1]) || 0;

	let d = '';
	const {childNodes} = svg;
	for (let i = 0; i < childNodes.length; i++) {
		const el = childNodes[i];
		if (el.nodeType !== ELEMENT_NODE) {
			continue;
		}
		d += elementToPaths(el, resource);
	}
	return buildScript({
		offsetX,
		offsetY,
		width,
		height,
		d,
		html: svgString,
		resource,
	});
}

const svgToIcon = {
	toIconJsObject(svgfile, opt = {}) {
		const fs = require('fs');
		const svgCode = fs.readFileSync(require.resolve(svgfile), 'utf-8');
		return svgToIcon.sourceToIconJsObject(svgCode, Object.assign({}, {
			resource: svgfile,
		}, opt));
	},
	sourceToIconJsObject(svgCode, opt = {}) {
		let {resource} = opt;
		let idx = resource.indexOf('\\node_modules\\');
		if (idx === -1) {
			idx = resource.indexOf('/node_modules/');
		}
		if (idx >= 0) {
			resource = resource.substr(idx + '/node_modules/'.length);
		}
		if (opt['glyph-name'] || opt.unicode) {
			return glyphToJSON(svgCode, {
				glyphName: opt['glyph-name'],
				unicode: opt.unicode,
			}, resource);
		} else {
			return svgToJSON(svgCode, resource);
		}
	},
};

module.exports = svgToIcon;