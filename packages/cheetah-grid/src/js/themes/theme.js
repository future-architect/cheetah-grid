/*eslint no-bitwise:0*/
'use strict';

const {getChainSafe} = require('../internal/utils');
const defaultTheme = require('./MATERIAL_DESIGN');

function getProp(obj, superObj, names, defNames) {
	return getChainSafe(obj, ...names) ||
		(defNames && getChainSafe(obj, ...defNames)) ||
		getChainSafe(superObj, ...names);
}
function createTheme(obj = {}, superTheme = defaultTheme) {
	if (obj.hiliteBorderColor && !obj.highlightBorderColor) {
		// https://github.com/future-architect/cheetah-grid/issues/83
		console.warn('Please use highlightBorderColor instead of hiliteBorderColor. cheetah-grid@>=0.7');
		obj.highlightBorderColor = obj.hiliteBorderColor;
	}

	return {
		get font() {
			return getProp(obj, superTheme, ['font']);
		},
		get underlayBackgroundColor() {
			return getProp(obj, superTheme, ['underlayBackgroundColor']);
		},
		// color
		get color() {
			return getProp(obj, superTheme, ['color']);
		},
		get frozenRowsColor() {
			return getProp(obj, superTheme, ['frozenRowsColor'], ['color']);
		},
		// background
		get defaultBgColor() {
			return getProp(obj, superTheme, ['defaultBgColor']);
		},
		get frozenRowsBgColor() {
			return getProp(obj, superTheme, ['frozenRowsBgColor'], ['defaultBgColor']);
		},
		get selectionBgColor() {
			return getProp(obj, superTheme, ['selectionBgColor'], ['defaultBgColor']);
		},
		// border
		get borderColor() {
			return getProp(obj, superTheme, ['borderColor']);
		},
		get frozenRowsBorderColor() {
			return getProp(obj, superTheme, ['frozenRowsBorderColor'], ['borderColor']);
		},
		get highlightBorderColor() {
			return getProp(obj, superTheme, ['highlightBorderColor'], ['borderColor']);
		},
		get checkbox() {
			return this._checkbox || (this._checkbox = {
				get uncheckBgColor() {
					return getProp(obj, superTheme, ['checkbox', 'uncheckBgColor'], ['defaultBgColor']);
				},
				get checkBgColor() {
					return getProp(obj, superTheme, ['checkbox', 'checkBgColor'], ['defaultBgColor']);
				},
				get borderColor() {
					return getProp(obj, superTheme, ['checkbox', 'borderColor'], ['borderColor']);
				}
			});
		},
		get button() {
			return this._button || (this._button = {
				get color() {
					return getProp(obj, superTheme, ['button', 'color'], ['color']);
				},
				get bgColor() {
					return getProp(obj, superTheme, ['button', 'bgColor'], ['defaultBgColor']);
				},
			});
		},
		get header() {
			return this._header || (this._header = {
				get sortArrowColor() {
					return getProp(obj, superTheme, ['header', 'sortArrowColor']);
				},
			});
		},
		extends(obj) {
			return createTheme(obj, this);
		}
	};
}

/**
 * theme object
 * @type {Object}
 * @namespace cheetahGrid.themes.theme
 * @memberof cheetahGrid.themes
 */
module.exports = {
	create(obj) {
		return createTheme(obj);
	}
};
