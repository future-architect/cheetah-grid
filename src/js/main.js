'use strict';

{
	const core = require('./core');
	const tools = require('./tools');
	const columns = require('./columns');
	const themes = require('./themes');
	const data = require('./data');
	
	const ListGrid = require('./ListGrid');
	const GridCanvasHelper = require('./GridCanvasHelper');
	
	const color = require('./internal/color');
	const sort = require('./internal/sort');
	const symbolManager = require('./internal/symbolManager');
	const path2DManager = require('./internal/path2DManager');
	const icons = require('./icons');
	const register = require('./register');
	
	/**
	 * Cheetah Grid
	 * @type {Object}
	 * @namespace cheetahGrid
	 */
	module.exports = {
		core,
		tools,

		// impl Grids
		ListGrid,

		// objects
		columns,
		themes,
		data,

		// helper
		GridCanvasHelper,
		get icons() {
			return icons.get();
		},

		//plugin registers
		register,

		get _internal() {
			console.warn('use internal!!');
			return {
				color,
				sort,
				symbolManager,
				path2DManager,
			};
		}
	};
}