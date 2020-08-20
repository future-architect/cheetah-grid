'use strict';
const path = require('path');
const webpack = require('webpack');
const rm = require('rimraf');
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
function resolve(dir) {
	return path.join(__dirname, dir);
}

rm.sync(path.join(resolve('dist/'), '*'));

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
		mode: opt.mode || 'production',
		context: resolve('dist-ts/'),
		entry: entries,
		output: {
			path: resolve('dist/'),
			filename: `${filenamePrefix}${suffix}.js`,
			library,
			libraryTarget: 'umd',
			devtoolModuleFilenameTemplate,
			devtoolFallbackModuleFilenameTemplate: devtoolModuleFilenameTemplate,
		},
		resolve: {
			extensions: ['.js'],
			alias: {
				'@': resolve('src/js')
			}
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: ['babel-loader'],
				},
				{
					test: /\.css$/,
					exclude: /node_modules/,
					use: ['style-loader',
						{
							loader: 'css-loader',
							options: {
								sourceMap: false
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								sourceMap: false,
								plugins: [
									require('cssnano')({
										preset: 'default',
									}),
									require('autoprefixer')({
										grid: true,
									})
								]
							}
						}
					]
				},
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
		],
		devtool: '#source-map',
	};
};

function newEs6Config(opt) {
	opt = Object.assign({}, opt);
	opt.mode = opt.mode || 'development';
	opt.plugins = [
		new WrapperPlugin({
			test: /\.js$/,
			header: '(function(window){\n',
			footer: '\n}).call(typeof global !== "undefined" ? global : window, typeof global !== "undefined" ? global : window);'
		}),
		...(opt.plugins || []),
	];
	return newDefaultProps(opt);
}

function newEs5Config(opt) {
	opt = opt || {};
	opt = Object.assign({}, opt);
	opt.suffix = opt.suffix || '';
	opt.plugins = [
		new WrapperPlugin({
			test: /\.js$/,
			header: '(function(window){\n',
			footer: '\n}).call(typeof global !== "undefined" ? global : window, typeof global !== "undefined" ? global : window);'
		}),
		new BabelPlugin({
			test: /\.js$/,
			presets: ['@babel/env'],
			sourceMaps: true
		}),
		new WrapperPlugin({
			test: /\.js$/,
			header: '(function(){\n',
			footer: '\n})();'
		}), ...(opt.plugins || [])
	];
	opt.mode = opt.mode || 'development';


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
		new webpack.optimize.AggressiveMergingPlugin(),
		...(opt.plugins || [])
	];
	opt.mode = 'production';
	return newEs6Config(opt);
}
function newEs5MinConfig(opt) {
	opt = opt || {};
	opt = Object.assign({}, opt);
	opt.plugins = [
		new webpack.optimize.AggressiveMergingPlugin(),
		...(opt.plugins || [])
	];
	opt.mode = 'production';
	return newEs5Config(opt);
}

const liveReloadOpt = Object.assign({}, gridOpt);
liveReloadOpt.plugins = [
	...(liveReloadOpt.plugins || []),
	new LiveReloadPlugin(),
];


module.exports = [
	newEs6Config(gridOpt),
	newEs5Config(Object.assign({suffix: '.es5'}, liveReloadOpt)),
	newEs6MinConfig(Object.assign({suffix: '.min'}, gridOpt)),
	newEs5MinConfig(Object.assign({suffix: '.es5.min'}, gridOpt)),
	// newEs5Config(Object.assign({suffix: ''}, extToolsEntriesOpt)),
	// newEs5MinConfig(Object.assign({suffix: '.min'}, extToolsEntriesOpt)),
];
