'use strict';
const path = require('path');
const webpack = require('webpack');
const rm = require('rimraf');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const PACKAGEJSON = require('./package.json');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const WrapperPlugin = require('wrapper-webpack-plugin');
const BabelPlugin = require('./webpack/fork/babel-webpack-plugin/index');
const BANNER = `/*! Cheetah Grid v${PACKAGEJSON.version} | license ${PACKAGEJSON.license} */`;
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');
ModuleFilenameHelpers.createFooter = function createFooter(module, requestShortener) {
	if (!module) { module = ''; }
	if (typeof module === 'string') {
		return [
			'// Cheetah Grid //',
			`// ${requestShortener.shorten(module)}`
		].join('\n');
	} else {
		return [
			'//////////////////',
			'// Cheetah Grid',
			`// ${module.readableIdentifier(requestShortener)}`,
			`// module id = ${module.id}`,
			`// module chunks = ${module.mapChunks((c) => c.id).join(' ')}`
		].join('\n');
	}
};

rm.sync(path.join(path.resolve(__dirname, 'dist/'), '*'));

const gridOpt = {
	entries: {
		cheetahGrid: './main.js',
	}
};

// const extToolsEntriesOpt = {
// 	entries: {
// 		fontTools: './extentions/tools/fontTools.js',
// 	},
// 	library: ['extentions', 'tools', '[name]'],
// };

const newDefaultProps = (opt = {}) => {
	const {
		suffix = '',
		plugins = [],
		entries
	} = opt;
	let {
		library = '[name]'
	} = opt;
	let filenamePrefix = library;
	if (Array.isArray(library)) {
		filenamePrefix = library.join('/');
		library = ['cheetahGrid', ...library];
	}
	const devtoolModuleFilenameTemplate = ({resourcePath}) => {
		if (resourcePath.indexOf('node_modules') >= 0) {
			resourcePath = resourcePath.substr(resourcePath.indexOf('node_modules'));
		}
		return `cheetahGrid${suffix}/${resourcePath}`;
	};
	return {
		context: path.resolve(__dirname, 'src/js/'),
		entry: entries,
		output: {
			path: path.resolve(__dirname, 'dist/'),
			filename: `${filenamePrefix}${suffix}.js`,
			library,
			libraryTarget: 'umd',
			devtoolModuleFilenameTemplate,
			devtoolFallbackModuleFilenameTemplate: devtoolModuleFilenameTemplate,
		},
		resolveLoader: {
			alias: {
				'svg-to-cheetahgrid-icon-js-loader': require.resolve('./webpack-loader/svg-to-icon-js-loader')
			}
		},
		resolve: {
			extensions: ['.js'],
		},

		module: {
			loaders: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
				}
			]
		},
		plugins: [
			// new webpack.SourceMapDevToolPlugin({
			// 	exclude: /^webpack/,
			// 	filename: '[name]' + suffix + '.js.map',
			//	moduleFilenameTemplate: 'cheetahGrid' + suffix + '/[resource-path]',
			//	fallbackModuleFilenameTemplate: 'cheetahGrid' + suffix + '/[resource-path]',
			// }),
			...plugins,
			new webpack.optimize.ModuleConcatenationPlugin(),
			new webpack.optimize.OccurrenceOrderPlugin(),
			new webpack.BannerPlugin({banner: BANNER, raw: true, entryOnly: true}),
			new LiveReloadPlugin(),
		],
		devtool: '#source-map',
	};
};

function newEs6Config(opt) {
	opt = Object.assign({}, opt);
	return newDefaultProps(opt);
}

function newEs5Config(opt) {
	opt = opt || {};
	opt = Object.assign({}, opt);
	opt.suffix = opt.suffix || '';
	opt.plugins = [
		new WrapperPlugin({
			test: /\.js$/,
			header: '(function(){\n',
			footer: '\n}).call(typeof global !== "undefined" ? global : window);'
		}),
		new BabelPlugin({
			test: /\.js$/,
			presets: ['es2015'],
			sourceMaps: true
		}),
		new WrapperPlugin({
			test: /\.js$/,
			header: '(function(){\n',
			footer: '\n})();'
		}), ...(opt.plugins || [])
	];

			
	const es5 = newDefaultProps(opt);
	// es5.module.loaders[0].query = {
	// 	presets: ['es2015']
	// };
	return es5;
}

function newEs6MinConfig(opt) {
	opt = opt || {};
	opt = Object.assign({}, opt);
	opt.plugins = [
		//minify
		new UglifyJsPlugin({
			sourceMap: true,
			uglifyOptions: {ecma: 6},
		}),
		new webpack.optimize.AggressiveMergingPlugin(),
		...(opt.plugins || [])
	];
	return newEs6Config(opt);
}
function newEs5MinConfig(opt) {
	opt = opt || {};
	opt = Object.assign({}, opt);
	opt.plugins = [
		//minify
		new UglifyJsPlugin({sourceMap: true}),
		new webpack.optimize.AggressiveMergingPlugin(),
		...(opt.plugins || [])
	];
	return newEs5Config(opt);
}


module.exports = [
	newEs6Config(gridOpt),
	newEs5Config(Object.assign({suffix: '.es5'}, gridOpt)),
	newEs6MinConfig(Object.assign({suffix: '.min'}, gridOpt)),
	newEs5MinConfig(Object.assign({suffix: '.es5.min'}, gridOpt)),
	// newEs5Config(Object.assign({suffix: ''}, extToolsEntriesOpt)),
	// newEs5MinConfig(Object.assign({suffix: '.min'}, extToolsEntriesOpt)),
];