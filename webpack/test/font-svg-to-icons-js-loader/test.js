/*eslint-disable no-sync*/
'use strict';

const path = require('path');
const fs = require('fs');
const loader = require('../../../webpack-loader/font-svg-to-icons-js-loader');
const UglifyJS = require('uglify-js');
const babel = require('babel-core');

function buildCode(svgfile) {
	const script = `
/*eslint-disable max-len*/
/*global cheetahGrid*/
'use strict';
(function() {
	const module = {};
	${loader.directLoad(svgfile).replace(/\r?\n|\r/g, `
	`)}
	cheetahGrid.register.icons(module.exports);
})();`;
	return script;
}

function toIconsJs(svgfile, opt = {}) {
	let script = buildCode(svgfile, opt);
	fs.writeFileSync(opt.targetPath, script, 'utf-8');
	if (opt.es5) {
		script = babel.transform(script, {presets: ['es2015']}).code;
		if (opt.minify) {
			script = UglifyJS.minify(script).code;
		}
	}
	
	return script;
}

{
	const targetPath = path.resolve(__dirname, './fa_icons.js');
	const script = toIconsJs('font-awesome/fonts/fontawesome-webfont.svg', {
		es5: true,
		minify: true,
		targetPath,
	});
	console.log('write: ', targetPath);
	fs.writeFileSync(targetPath, script, 'utf-8');
}

{
	const targetPath = path.resolve(__dirname, './mdi_icons.js');
	const script = toIconsJs('material-design-icons/iconfont/MaterialIcons-Regular.svg', {
		es5: true,
		minify: true,
		targetPath,
	});
	console.log('write: ', targetPath);
	fs.writeFileSync(targetPath, script, 'utf-8');
}
