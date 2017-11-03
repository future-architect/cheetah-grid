'use strict';
const path = require('path');
const Metalsmith = require('metalsmith');
const collections = require('metalsmith-collections');
const layouts = require('metalsmith-layouts');
//const markdown = require('metalsmith-markdown');
//const permalinks = require('metalsmith-permalinks');
const inPlace = require('metalsmith-in-place');
const codeHighlight = require('./metalsmith-code-highlight');
const textContents = require('./metalsmith-text-contents');
const i18n = require('./metalsmith-i18n-files');
const mstatic = require('metalsmith-static');

const registerHbsPartials = require('./handlebars/register-partials');
const registerHbsHelpers = require('./handlebars/helpers');

const cheetah = require('../package.json');

const hbs = {
	directory: 'hbs/layouts',
	partials: 'hbs/partials',
};

registerHbsPartials({
	dirname: __dirname,
	partialsPath: hbs.partials,
});
registerHbsHelpers();

const demos = {
	allDemos: {
		pattern: 'demos/**/*.html*',
		sortBy: 'order'
	},
};
const docScript = require('./src/script/script');

Metalsmith(__dirname).
			
	metadata({
		demoCategorys: [
			'Sample',
			'Usage',
			'FAQ',
		],
		script: docScript,
		version: cheetah.version,
	}).
	source('./src').
	destination(`./${cheetah.version}`).

	clean(true).
	use(mstatic({
		src: path.relative(path.resolve('.'), require.resolve('highlight.js/styles/kimbie.dark.css')),
		dest: 'css/highlightjs.css'
	})).
	// use(assets(
	// )).
	use(layouts({
		engine: 'handlebars',
		directory: hbs.directory,
		partials: hbs.partials,
		pattern: ['**/*.dummy'],
	})).
	use(i18n()).
	use(collections(demos)).
	use(textContents({
		demos: 'demos/**/*.parts*'
	})).
	use(textContents({
		demos: 'demos/*.parts*'
	})).
	use(inPlace({
		pattern: '*.hbs',
	})).
	use(inPlace({
		pattern: '**/*.hbs',
	})).
	use(layouts({
		engine: 'handlebars',
		directory: hbs.directory,
		// partials: hbs.partials,
		pattern: ['**/*.html', '**/*.svg'],
		// default: '{{{contents}}}',
	})).
	use(codeHighlight()).
	build((err) => {
		if (err) { throw err; } // error handling is required
	});

	
