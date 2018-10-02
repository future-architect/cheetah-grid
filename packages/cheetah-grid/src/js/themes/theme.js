/*eslint no-bitwise:0*/
'use strict';

const {getChainSafe} = require('../internal/utils');
//private symbol
const _ = require('../internal/symbolManager').get();

function getProp(obj, superObj, names, defNames) {
	return getChainSafe(obj, ...names) ||
		getChainSafe(superObj, ...names) ||
		(defNames && getChainSafe(obj, ...defNames)) ||
		(defNames && getChainSafe(superObj, ...defNames));
}

class Theme {
	constructor(obj = {}, superTheme = {}) {
		if (obj.hiliteBorderColor && !obj.highlightBorderColor) {
			// https://github.com/future-architect/cheetah-grid/issues/83
			console.warn('Please use highlightBorderColor instead of hiliteBorderColor. cheetah-grid@>=0.7');
			obj.highlightBorderColor = obj.hiliteBorderColor;
		}
		this[_] = {
			obj,
			superTheme
		};
	}
	get font() {
		const {obj, superTheme} = this[_];
		return getProp(obj, superTheme, ['font']);
	}
	get underlayBackgroundColor() {
		const {obj, superTheme} = this[_];
		return getProp(obj, superTheme, ['underlayBackgroundColor']);
	}
	// color
	get color() {
		const {obj, superTheme} = this[_];
		return getProp(obj, superTheme, ['color']);
	}
	get frozenRowsColor() {
		const {obj, superTheme} = this[_];
		return getProp(obj, superTheme, ['frozenRowsColor'], ['color']);
	}
	// background
	get defaultBgColor() {
		const {obj, superTheme} = this[_];
		return getProp(obj, superTheme, ['defaultBgColor']);
	}
	get frozenRowsBgColor() {
		const {obj, superTheme} = this[_];
		return getProp(obj, superTheme, ['frozenRowsBgColor'], ['defaultBgColor']);
	}
	get selectionBgColor() {
		const {obj, superTheme} = this[_];
		return getProp(obj, superTheme, ['selectionBgColor'], ['defaultBgColor']);
	}
	// border
	get borderColor() {
		const {obj, superTheme} = this[_];
		return getProp(obj, superTheme, ['borderColor']);
	}
	get frozenRowsBorderColor() {
		const {obj, superTheme} = this[_];
		return getProp(obj, superTheme, ['frozenRowsBorderColor'], ['borderColor']);
	}
	get highlightBorderColor() {
		const {obj, superTheme} = this[_];
		return getProp(obj, superTheme, ['highlightBorderColor'], ['borderColor']);
	}
	get checkbox() {
		const {obj, superTheme} = this[_];
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
	}
	get button() {
		const {obj, superTheme} = this[_];
		return this._button || (this._button = {
			get color() {
				return getProp(obj, superTheme, ['button', 'color'], ['color']);
			},
			get bgColor() {
				return getProp(obj, superTheme, ['button', 'bgColor'], ['defaultBgColor']);
			},
		});
	}
	get header() {
		const {obj, superTheme} = this[_];
		return this._header || (this._header = {
			get sortArrowColor() {
				return getProp(obj, superTheme, ['header', 'sortArrowColor'], ['color']);
			},
		});
	}
	extends(obj) {
		return new Theme(obj, this);
	}
}


/**
 * theme object
 * @type {Object}
 * @namespace cheetahGrid.themes.theme
 * @memberof cheetahGrid.themes
 */
module.exports = {
	Theme
};
