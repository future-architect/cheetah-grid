'use strict';
{
	const {extend, getIgnoreCase} = require('./internal/utils');
	const theme = require('./themes/theme');
	const plugins = require('./plugins/themes');
	const BASIC = theme.create(require('./themes/BASIC'));
	const MATERIAL_DESIGN = theme.create(require('./themes/MATERIAL_DESIGN'));

	const builtin = {
		BASIC,
		MATERIAL_DESIGN,
	};
	let defTheme = theme.create({});
	/**
	 * themes
	 * @type {Object}
	 * @namespace cheetahGrid.themes
	 * @memberof cheetahGrid
	 */
	const themes = {
		get default() {
			return defTheme;
		},
		set default(defaultTheme) {
			defTheme = defaultTheme;
		},
		theme,
		of(value) {
			if (!value) {
				return null;
			}
			if (typeof value === 'string') {
				const t = getIgnoreCase(themes.choices, value);
				if (t) {
					return t;
				}
				return null;
			}
			return value;
		},
		/**
		 * @namespace cheetahGrid.themes.choices
		 */
		get choices() {
			return extend(builtin, plugins);
		},
	};
	module.exports = themes;
}