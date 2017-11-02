'use strict';

const cheetah = require('../package.json');

module.exports = {
	tags: {
		allowUnknownTags: true,
		dictionaries: ['jsdoc', 'closure']
	},
	source: {
		include: [
		],
		exclude: [
		],
		includePattern: '.+\\.js(doc|x)?$',
		excludePattern: '(^|\\/|\\\\)_'
	},
	plugins: [],
	templates: {
		cleverLinks: false,
		monospaceLinks: false
	},
	opts: {
		encoding: 'utf8',
		destination: `./${cheetah.version}/jsdoc/`,
		recurse: true,
		readme: '../README.md'
	}
};