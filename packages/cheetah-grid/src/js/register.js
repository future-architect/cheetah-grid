'use strict';

const themePlugins = require('./plugins/themes');
const iconPlugins = require('./plugins/icons');

function register(obj, name, value) {
	if (value) {
		const old = obj[name];
		obj[name] = value;
		return old;
	} else {
		return obj[name];
	}
}
function registers(obj, values) {
	for (const k in values) {
		obj[k] = values[k];
	}
}
module.exports = {
	theme(name, theme) {
		return register(themePlugins, name, theme);
	},
	icon(name, icon) {
		return register(iconPlugins, name, icon);
	},
	icons(icons) {
		registers(iconPlugins, icons);
	},
};