/*eslint-disable no-sync*/
'use strict';

const fs = require('fs');
const loaderUtils = require('loader-utils');
const fontSvgToIcons = require('./core/font-svg-to-icons');
const svgToIcon = require('./core/svg-to-icon');


const fontSvgLoader = function(source) {
	const {resource} = this;
	const params = loaderUtils.parseQuery(this.resourceQuery || '?') || {};
	params.resource = resource;
	return `module.exports = ${fontSvgToIcons.sourceToIconsJsObject(source, params)};`;
};

const svgLoader = function(source) {
	const {resource} = this;
	const params = loaderUtils.parseQuery(this.resourceQuery || '?') || {};
	params.resource = resource;
	return `module.exports = ${svgToIcon.sourceToIconJsObject(source, params)};`;
};

const loader = function(source, ...args) {
	const params = loaderUtils.parseQuery(this.resourceQuery || '?') || {};
	if (source.indexOf('<font-face') >= 0 && !params['glyph-name'] && !params.unicode) {
		return fontSvgLoader.call(this, source, ...args);
	} else {
		return svgLoader.call(this, source, ...args);
	}
};

loader.directLoad = function(resource) {
	const resourceQuery = resource.indexOf('?') >= 0 ? resource.substr(resource.indexOf('?')) : undefined;
	const resourcePath = resource.indexOf('?') >= 0 ? resource.substr(0, resource.indexOf('?')) : resource;
	const context = {
		resource,
		resourceQuery,
		resourcePath,
	};
	const code = fs.readFileSync(require.resolve(resourcePath), 'utf-8');
	return loader.call(context, code);
};

module.exports = loader;