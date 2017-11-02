/*eslint-disable no-sync*/
'use strict';

const fs = require('fs');
const svgToIcon = require('./svg-to-cheetahgrid-icon');
const UglifyJS = require('uglify-js');
const babel = require('babel-core');
const jsdom = require('jsdom');

function toGlyphs(svgCode) {
	const document = new jsdom.JSDOM().window.document.createElement('div');
	document.innerHTML = svgCode;
	const svg = document.children[0];

	const glyphs = [];
	function findGlyph(el) {
		for (const child of el.children) {
			if (child.getAttribute('unicode') && child.getAttribute('d')) {
				glyphs.push(child);
			} else {
				findGlyph(child);
			}
		}
	}
	findGlyph(svg);
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
	return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
}

function toCodeString(code) {
	let ret = '';
	for (let i = 0; i < code.length; i++) {
		ret += charToHexCodeStr(code[i]);
	}
	return ret;
}

function buildCode(svgfile, {
	name = 'unicode'
} = {}) {
	const svgCode = fs.readFileSync(require.resolve(svgfile), 'utf-8');
	let script = `
/*eslint-disable max-len*/
/*global cheetahGrid*/
'use strict';
cheetahGrid.register.icons({
`;
	toGlyphs(svgCode).forEach((glyph) => {
		const unicode = glyph.getAttribute('unicode');
		const targetName = glyph.getAttribute(name);
		script += `
	'${toCodeString(targetName)}': ${transform(unicode, svgCode, svgfile).replace(/\r?\n|\r/g, `
	`)},`;
	});
	script += '\n});';
	return script;
}

module.exports = {
	toIconsJs(svgfile, opt = {}) {
		let script = buildCode(svgfile, opt);
		if (opt.es5) {
			script = babel.transform(script, {presets: ['es2015']}).code;
			if (opt.minify) {
				script = UglifyJS.minify(script).code;
			}
		}
		return script;
	},
};