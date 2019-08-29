// https://github.com/ota-meshi/babel-webpack-plugin
const SourceMapSource = require("webpack-sources").SourceMapSource;
const OriginalSource = require("webpack-sources").OriginalSource;
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const RequestShortener = require("webpack/lib/RequestShortener");
const babel = require("@babel/core");
const webpack = require('webpack');

/**
 * @typedef {import("webpack").Compiler} Compiler
 */

class BabelPlugin {
	constructor(options) {
		if(typeof options !== "object" || Array.isArray(options)) options = {};
		this.options = options;
	}

	/**
	 * @param {Compiler} compiler webpack.Compiler
	 */ 
	apply(compiler) {
		const options = this.options;
		options.test = options.test || /\.js($|\?)/i;
		options.presets = options.presets || ["es2015"];
		options.compact = options.compact || false;

		const requestShortener = new RequestShortener(compiler.context);
		compiler.hooks.compilation.tap("BabelPlugin", (compilation) => {
			if(options.sourceMaps) {
				compilation.hooks.buildModule.tap("BabelPlugin", (module) => {
					// to get detailed location info about errors
					module.useSourceMap = true;
				});
			}
			compilation.hooks.optimizeChunkAssets.tapAsync("BabelPlugin", (chunks, callback) => {
				let files = [];
				chunks.forEach((chunk) => files.push(...chunk.files));
				files.push(...compilation.additionalChunkAssets);
				files = files.filter(ModuleFilenameHelpers.matchObject.bind(undefined, options));
				files.forEach((file) => {
					let sourceMap;
					try {
						const asset = compilation.assets[file];
						if(asset.__BabelPlugin) {
							compilation.assets[file] = asset.__BabelPlugin;
							return;
						}

						let input;
						let inputSourceMap;
						const fileOptions = Object.assign({}, options);
						delete fileOptions.test;

						if(options.sourceMaps) {
							if(asset.sourceAndMap) {
								const sourceAndMap = asset.sourceAndMap();
								inputSourceMap = sourceAndMap.map;
								input = sourceAndMap.source;
							} else {
								inputSourceMap = asset.map();
								input = asset.source();
							}
							// fileOptions.inputSourceMap = inputSourceMap;
						} else {
							input = asset.source();
						}
						fileOptions.sourceRoot = "";
						fileOptions.sourceFileName = file;

						const result = babel.transform(input, fileOptions);

						let map;
						if(options.sourceMaps) {
							map = result.map;
						}

						const source = result.code;

						compilation.assets[file] = (map ?
							new SourceMapSource(source, file, map, input, inputSourceMap) :
							new OriginalSource(source, file));

						compilation.assets[file].__BabelPlugin = compilation.assets[file];

					} catch(err) {
						if(err.line) {
							const original = sourceMap && sourceMap.originalPositionFor({
								line: err.line,
								column: err.col
							});
							if(original && original.source) {
								compilation.errors.push(new Error(file + " from Babel\n" + err.message + " [" + requestShortener.shorten(original.source) + ":" + original.line + "," + original.column + "][" + file + ":" + err.line + "," + err.col + "]"));
							} else {
								compilation.errors.push(new Error(file + " from Babel\n" + err.message + " [" + file + ":" + err.line + "," + err.col + "]"));
							}
						} else if(err.msg) {
							compilation.errors.push(new Error(file + " from Babel\n" + err.msg));
						} else {
							compilation.errors.push(new Error(file + " from Babel\n" + err.stack));
						}
					}
				});
				callback();
			});
		});
	}
}

module.exports = BabelPlugin;
