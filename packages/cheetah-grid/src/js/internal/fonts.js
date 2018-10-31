'use strict';

const {isNode} = require('./utils');

const loads = {};
let load;
let check;
if (isNode) {
	load = function(font, testStr, callback) {
		callback();
	};
	check = function() {
		return false;
	};
} else {
	const legacy = !document.fonts;
	load = legacy ? function(font, testStr, callback) {
		//for legacy(IE)
		if (loads[`${font} @ ${testStr}`]) {
			callback();
			return;
		}
		require('./legacy/fontwatch/FontWatchRunner').load(font, testStr, () => {
			loads[`${font} @ ${testStr}`] = true;
			callback();
		}, () => {
			loads[`${font} @ ${testStr}`] = true;
			callback();
		});
	} : function(font, testStr, callback) {
		if (loads.all || loads[font]) {
			callback();
			return;
		}
		document.fonts.ready.then(() => {
			loads.all = true;
		});
		document.fonts.load(font).then(() => {
			loads[font] = true;
			callback();
		});
	};
	check = legacy ? function(font, testStr) {
		//for legacy(IE)
		if (loads[`${font} @ ${testStr}`]) {
			return true;
		}
		load(font, testStr, () => {});
		return false;
	} : function(font, testStr) {
		if (loads.all || loads[font]) {
			return true;
		}
		if (!document.fonts.check(font)) {
			load(font, testStr, () => {});
			return false;
		}
		return true;
	};
}

module.exports = {
	check,
	load
};
