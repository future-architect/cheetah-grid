/*eslint no-bitwise:0*/
'use strict';

function FROZEN_ROWS_BORDER_COLOR(args) {
	const {
		row,
		grid: {frozenRowCount}
	} = args;
	if (frozenRowCount - 1 === row) {
		return ['#f2f2f2', '#f2f2f2', '#ccc7c7', '#f2f2f2'];
	} else {
		return ['#f2f2f2'];
	}
}

/**
 * material design theme
 * @name MATERIAL_DESIGN
 * @type {Object}
 * @memberof cheetahGrid.themes.choices
 */
module.exports = {
	color: 'rgba(0, 0, 0, 0.87)',
	defaultBgColor: '#FFF',
	frozenRowsBgColor: '#FFF',
	frozenRowsColor: 'rgba(0, 0, 0, 0.54)',
	hiliteBorderColor: '#5E9ED6',
	selectionBgColor: '#CCE0FF',
	borderColor: ['#ccc7c7', null],
	frozenRowsBorderColor: FROZEN_ROWS_BORDER_COLOR,
	checkbox: {
		uncheckBgColor: '#FFF',
		checkBgColor: 'rgb(76, 73, 72)',
		borderColor: 'rgba(0, 0, 0, 0.26)',
	},
	button: {
		color: '#FFF',
		bgColor: '#2196F3',
	}
};