/*eslint prefer-template: "off"*/
'use strict';
(function() {

	const getScript = function() {
		const scripts = document.getElementsByTagName('script');
		return scripts[scripts.length - 1];
	};

	const getPath = function(url) {
		const m = url.match('(^.*)[?#]');
		return m ? m[1] : url;
	};
	const getAbsolutePath = function(path) {
		const a = document.createElement('a');
		a.href = path;
		return a.href;
	};

	window.module = {};

	const modules = {};
	const setExports = function(module) {
		let path = getScript().src;
		path = getPath(path);
		const url = getAbsolutePath(path);
		modules[url] = module;
	};
	const getExports = function() {
		let path = getScript().src;
		path = getPath(path);
		const url = getAbsolutePath(path);
		return modules[url] ? modules[url] : (modules[url] = {});
	};
	window.require = function(path) {
		let at = getScript().src;
		at = getPath(at);
		if (at) {
			at += '/../';
		}
		const url = getAbsolutePath(at + path + '.js');
		if (!modules[url]) {
			throw new Error('not import ' + url + ' at ' + at);
		}
		return modules[url];
	};

	Object.defineProperty(window.module, 'exports', {
		set: setExports,
		get: getExports,
	});


})();