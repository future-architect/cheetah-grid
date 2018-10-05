/*eslint-disable no-sync*/
'use strict';

const svgToIcon = require('./svg-to-icon');
const svgData = require('./svg-data');

function toGlyphs(svgCode) {
	const svg = svgData.get(svgCode);

	const glyphs = [];
	svg.walkAllGlyph((el) => glyphs.push(el));
	return glyphs;
}

function transform(glyphUnicode, svgCode, svgfile) {
	return svgToIcon.sourceToIconJsObject(svgCode, {
		unicode: glyphUnicode,
		resource: svgfile,
	});
}

function charToHexCodeStr(c) {
	if (/[!#-&(-[\]-_a-~]/.test(c)) {
		return c;
	}
	return `\\u${(`0000${c.charCodeAt(0).toString(16)}`).slice(-4)}`;
}

function toCodeString(code) {
	let ret = '';
	for (let i = 0; i < code.length; i++) {
		ret += charToHexCodeStr(code[i]);
	}
	return ret;
}

function buildObjectCode(svgCode, resource, {
	name = 'unicode'
} = {}) {
	let script = '{\n';
	toGlyphs(svgCode).forEach((glyph) => {
		const unicode = glyph.getAttribute('unicode');
		const targetName = glyph.getAttribute(name);
		script += `
	'${toCodeString(targetName)}': ${transform(unicode, svgCode, resource).replace(/\r?\n|\r/g, `
	`)},`;
	});
	script += '\n}';
	return script;
}

const svgToIcons = {
	toIconsJsObject(svgfile, opt = {}) {
		const fs = require('fs');
		const svgCode = fs.readFileSync(require.resolve(svgfile), 'utf-8');
		return svgToIcons.sourceToIconsJsObject(svgCode, Object.assign({}, {
			resource: svgfile,
		}, opt));
	},
	sourceToIconsJsObject(svgCode, opt = {}) {
		let {resource} = opt;
		let idx = resource.indexOf('\\node_modules\\');
		if (idx === -1) {
			idx = resource.indexOf('/node_modules/');
		}
		if (idx >= 0) {
			resource = resource.substr(idx + '/node_modules/'.length);
		}
		return buildObjectCode(svgCode, resource, opt);
	}
};

module.exports = svgToIcons;