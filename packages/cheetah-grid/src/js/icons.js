/*eslint-disable camelcase*/
'use strict';

const {extend} = require('./internal/utils');
const plugins = require('./plugins/icons');
const builtins = {
	get arrow_upward() {
		return require('../../webpack-loader/svg-to-icon-js-loader!material-design-icons/navigation/svg/production/ic_arrow_upward_48px.svg');
	},
	get arrow_downward() {
		return require('../../webpack-loader/svg-to-icon-js-loader!material-design-icons/navigation/svg/production/ic_arrow_downward_48px.svg');
	},
	get edit() {
		return require('../../webpack-loader/svg-to-icon-js-loader!material-design-icons/image/svg/production/ic_edit_48px.svg');
	},
	get add() {
		return require('../../webpack-loader/svg-to-icon-js-loader!material-design-icons/content/svg/production/ic_add_48px.svg');
	},
	get star() {
		return require('../../webpack-loader/svg-to-icon-js-loader!material-design-icons/toggle/svg/production/ic_star_24px.svg');
	},
	get star_border() {
		return require('../../webpack-loader/svg-to-icon-js-loader!material-design-icons/toggle/svg/production/ic_star_border_24px.svg');
	},
	get star_half() {
		return require('../../webpack-loader/svg-to-icon-js-loader!material-design-icons/toggle/svg/production/ic_star_half_24px.svg');
	},
};

module.exports = {
	get() {
		return extend(builtins, plugins);
	}
};