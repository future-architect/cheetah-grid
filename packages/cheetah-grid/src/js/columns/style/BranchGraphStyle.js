'use strict';
const BaseStyle = require('./BaseStyle');
let defaultStyle;
function adj(style) {
	const {textAlign = 'center'} = style;
	style.textAlign = textAlign;
	return style;
}
const DEFAULT_BRANCH_COLORS = (name, index) => {
	switch (index % 3) {
	case 0:
		return '#979797';
	case 1:
		return '#008fb5';
	case 2:
		return '#f1c109';
	default:
	}
	return '#979797';
};
class BranchGraphStyle extends BaseStyle {
	static get DEFAULT() {
		return defaultStyle ? defaultStyle : (defaultStyle = new BranchGraphStyle());
	}
	constructor(style = {}) {
		super(adj(style));
		this._branchColors = style.branchColors || DEFAULT_BRANCH_COLORS;
		this._margin = style.margin || 4;
		this._circleSize = style.circleSize || 16;
		this._branchLineWidth = style.branchLineWidth || 4;
		this._mergeStyle = style.mergeStyle === 'straight' ? 'straight' : 'bezier';
	}
	get branchColors() {
		return this._branchColors;
	}
	set branchColors(branchColors) {
		this._branchColors = branchColors;
		this.doChangeStyle();
	}
	get margin() {
		return this._margin;
	}
	set margin(margin) {
		this._margin = margin;
		this.doChangeStyle();
	}
	get circleSize() {
		return this._circleSize;
	}
	set circleSize(circleSize) {
		this._circleSize = circleSize;
		this.doChangeStyle();
	}
	get branchLineWidth() {
		return this._branchLineWidth;
	}
	set branchLineWidth(branchLineWidth) {
		this._branchLineWidth = branchLineWidth;
		this.doChangeStyle();
	}
	get mergeStyle() {
		return this._mergeStyle;
	}
	set mergeStyle(mergeStyle) {
		this._mergeStyle = mergeStyle;
		this.doChangeStyle();
	}
	clone() {
		return new BranchGraphStyle(this);
	}
}
module.exports = BranchGraphStyle;