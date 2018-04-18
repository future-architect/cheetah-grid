'use strict';
{
	const {isPromise} = require('../../internal/utils');
	const icons = require('../../internal/icons');
	module.exports = {
		loadIcons(icon, context, helper, callback) {
			if (icon) {
				if (isPromise(icon)) {
					icon.then((i) => {
						this.loadIcon(i, context.toCurrentContext(), callback);
					});
					icon = null;
				} else {
					const iconList = icons.toNormarizeArray(icon);
					iconList.forEach((i) => {
						helper.testFontLoad(i.font, i.content, context);
					});
					icon = iconList;
				}
			}
			callback(icon, context);
		},
	};
}