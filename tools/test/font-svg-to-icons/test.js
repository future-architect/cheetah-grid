/*eslint-disable no-sync*/
'use strict';

const path = require('path');
const fs = require('fs');
const tool = require('../../src/font-svg-to-cheetahgrid-icons');

{
	const targetPath = path.resolve(__dirname, './mdi_icons.js');
	const script = tool.toIconsJs('material-design-icons/iconfont/MaterialIcons-Regular.svg', {
		es5: true,
		minify: true,
	});
	console.log('write: ', targetPath);
	fs.writeFileSync(targetPath, script, 'utf-8');
}
{
	const targetPath = path.resolve(__dirname, './fa_icons.js');
	const script = tool.toIconsJs('font-awesome/fonts/fontawesome-webfont.svg', {
		es5: true,
		minify: true,
	});
	console.log('write: ', targetPath);
	fs.writeFileSync(targetPath, script, 'utf-8');
}

