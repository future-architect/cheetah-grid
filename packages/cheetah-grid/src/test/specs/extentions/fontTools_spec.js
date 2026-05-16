/*eslint prefer-arrow-callback:"off", object-shorthand:"off", no-new-func:"off", prefer-destructuring: "off", require-atomic-updates:"off"*/
'use strict';
(function() {
	function normalizePath(path) {
		const result = [];
		path.split('/').forEach(function(part) {
			if (!part || part === '.') {
				return;
			}
			if (part === '..') {
				result.pop();
				return;
			}
			result.push(part);
		});
		return result.join('/');
	}

	function resolveRequest(request, from) {
		if (!request.startsWith('.')) {
			return request;
		}
		const base = from.split('/').slice(0, -1).join('/');
		const resolved = normalizePath(`${base}/${request}`);
		return /\.js$/u.test(resolved) ? resolved : `${resolved}.js`;
	}

	function createLoader(sources, stubs) {
		const cache = {};
		function load(id) {
			if (stubs[id]) {
				return stubs[id];
			}
			if (cache[id]) {
				return cache[id].exports;
			}
			if (!sources[id]) {
				throw new Error(`missing source: ${id}`);
			}
			const module = {exports: {}};
			cache[id] = module;
			const localRequire = function(request) {
				return load(resolveRequest(request, id));
			};
			const sourceUrl = `/src/js/${id}`;
			const execute = new Function('require', 'module', 'exports', `${sources[id]}\n//# sourceURL=${sourceUrl}`);
			execute(localRequire, module, module.exports);
			return module.exports;
		}
		return {load};
	}

	async function loadSources() {
		return {
			'extentions/tools/Thenable.js': (await import('../../../js/extentions/tools/Thenable.js?raw')).default,
			'extentions/tools/fontTools.js': (await import('../../../js/extentions/tools/fontTools.js?raw')).default,
			'extentions/tools/internal/AllFontsLoader.js': (await import('../../../js/extentions/tools/internal/AllFontsLoader.js?raw')).default,
			'extentions/tools/internal/FontsCssLoader.js': (await import('../../../js/extentions/tools/internal/FontsCssLoader.js?raw')).default,
			'extentions/tools/internal/Loader.js': (await import('../../../js/extentions/tools/internal/Loader.js?raw')).default,
			'extentions/tools/internal/xhr.js': (await import('../../../js/extentions/tools/internal/xhr.js?raw')).default,
		};
	}

	function toPromise(thenable) {
		return new Promise(function(resolve) {
			thenable.then(resolve);
		});
	}

	function createBaseStubs() {
		class LRUCache {
			constructor() {
				this._map = new Map();
			}
			get(key) {
				return this._map.get(key);
			}
			put(key, value) {
				this._map.set(key, value);
			}
		}
		return {
			'internal/utils.js': {
				isPromise: function(value) {
					return !!value && typeof value.then === 'function';
				},
			},
			'internal/icons.js': {
				getIconProps: function(tagName, className) {
					return {tagName, className, font: '12px icon'};
				},
			},
			'internal/LRUCache.js': LRUCache,
		};
	}

	describe('fontTools extension modules', function() {
		it('runs Thenable.all/resolve and Loader cache semantics', async function() {
			const sources = await loadSources();
			const loader = createLoader(sources, createBaseStubs());
			const Thenable = loader.load('extentions/tools/Thenable.js');
			const Loader = loader.load('extentions/tools/internal/Loader.js');
			const calls = [];

			Thenable.resolve('ready').then(function(value) {
				calls.push(['resolve', value]);
			});
			Thenable.resolve(Promise.resolve('promise')).then(function(value) {
				calls.push(['promise', value]);
			});
			Thenable.all([
				'a',
				Thenable.resolve('b'),
				Promise.resolve('c'),
			]).then(function(value) {
				calls.push(['all', value]);
			});
			const delayed = new Thenable(function(resolve) {
				setTimeout(function() {
					resolve('late');
				}, 1);
			});
			const delayedLoader = Loader.thenableOf(delayed);
			expect(delayedLoader.get()).toBeUndefined();
			expect(await toPromise(delayedLoader)).toEqual('late');
			expect(delayedLoader.get()).toEqual('late');

			await new Promise(function(resolve) {
				setTimeout(resolve, 10);
			});
			expect(calls).toContainEqual(['resolve', 'ready']);
			expect(calls).toContainEqual(['promise', 'promise']);
			expect(calls).toContainEqual(['all', ['a', 'b', 'c']]);
		});

		it('loads xhr results once per URL and applies mime overrides', async function() {
			const sources = await loadSources();
			const loader = createLoader(sources, createBaseStubs());
			const xhr = loader.load('extentions/tools/internal/xhr.js');
			const requests = [];
			const OriginalXHR = window.XMLHttpRequest;
			try {
				window.XMLHttpRequest = function() {
					this.open = function(method, url, async) {
						requests.push(['open', method, url, async]);
					};
					this.overrideMimeType = function(mimeType) {
						requests.push(['mime', mimeType]);
					};
					this.send = function() {
						this.responseText = 'body';
						this.onload();
					};
				};
				const cache = {};
				expect(await toPromise(xhr.get('font.woff2', 'text/plain'))).toEqual('body');
				const first = xhr.getOnCacheOrHttp('font.woff2', cache);
				const second = xhr.getOnCacheOrHttp('font.woff2', cache);
				expect(first).toBe(second);
				expect(await toPromise(first)).toEqual('body');
				expect(requests).toContainEqual(['open', 'GET', 'font.woff2', true]);
				expect(requests).toContainEqual(['mime', 'text/plain']);
			} finally {
				window.XMLHttpRequest = OriginalXHR;
			}
		});

		it('collects font faces from accessible and linked stylesheets', async function() {
			const sources = await loadSources();
			const stubs = createBaseStubs();
			stubs['extentions/tools/internal/xhr.js'] = {
				getOnCacheOrHttp: function(url) {
					return Promise.resolve(`@font-face { font-family: linked; src: url("${url}/linked.woff2"); }`);
				},
			};
			const loader = createLoader(sources, stubs);
			const AllFontsLoader = loader.load('extentions/tools/internal/AllFontsLoader.js');
			const originalSheets = document.styleSheets;
			const localRule = {
				type: CSSRule.FONT_FACE_RULE,
				cssText: '@font-face { font-family: local; src: url("local.woff2"); }',
				style: {
					getPropertyValue: function() {
						return 'url("local.woff2")';
					},
				},
			};
			const inaccessible = {};
			Object.defineProperty(inaccessible, 'cssRules', {
				get: function() {
					const error = new Error('blocked');
					error.name = 'SecurityError';
					throw error;
				},
			});
			inaccessible.href = 'https://cdn.example.com/fonts.css';
			try {
				Object.defineProperty(document, 'styleSheets', {
					configurable: true,
					value: [
						{href: 'https://example.com/css/app.css', cssRules: [localRule]},
						inaccessible,
						{href: 'file:///tmp/local.css', cssRules: [localRule]},
					],
				});
				const fontFaces = await toPromise(new AllFontsLoader());
				expect(fontFaces[0]).toEqual({
					urls: ['https://example.com/css/local.woff2'],
					css: '@font-face { font-family: local; src: url("local.woff2"); }',
				});
				expect(fontFaces[1].urls[0]).toEqual('https://cdn.example.com/fonts.css/linked.woff2');
			} finally {
				Object.defineProperty(document, 'styleSheets', {
					configurable: true,
					value: originalSheets,
				});
			}
		});

		it('inlines font CSS URLs as data URLs', async function() {
			const sources = await loadSources();
			const stubs = createBaseStubs();
			const loader = createLoader(sources, stubs);
			const Thenable = loader.load('extentions/tools/Thenable.js');
			stubs['extentions/tools/internal/AllFontsLoader.js'] = class AllFontsLoader extends Thenable {
				constructor() {
					super(function(resolve) {
						resolve([{
							css: '@font-face { src: url("font.woff2") format("woff2"), url(image.png); }',
							urls: ['font.woff2', 'image.png'],
						}]);
					});
				}
			};
			stubs['extentions/tools/internal/xhr.js'] = {
				getOnCacheOrHttp: function(url) {
					return Thenable.resolve(url === 'font.woff2' ? 'abc' : 'png');
				},
			};
			const FontsCssLoader = createLoader(sources, stubs).load('extentions/tools/internal/FontsCssLoader.js');
			const css = await toPromise(new FontsCssLoader());

			expect(css).toContain('data:application/font-woff;base64,YWJj');
			expect(css).toContain('url(\'data:image/png;base64,cG5n\')');
		});

		it('converts font content to SVG and supports callback, cache, arrays, and Promise fallback', async function() {
			const sources = await loadSources();
			const stubs = createBaseStubs();
			const loader = createLoader(sources, stubs);
			const Thenable = loader.load('extentions/tools/Thenable.js');
			stubs['extentions/tools/internal/FontsCssLoader.js'] = class FontsCssLoader extends Thenable {
				constructor() {
					super(function(resolve) {
						resolve('.icon{font-family:test;}');
					});
				}
				get() {
					return '.icon{font-family:test;}';
				}
			};
			const fontTools = createLoader(sources, stubs).load('extentions/tools/fontTools.js');
			const originalGetBBox = SVGElement.prototype.getBBox;
			const originalSvgGetBBox = SVGSVGElement.prototype.getBBox;
			const callbacks = [];
			try {
				const getBBox = function() {
					const text = this.querySelector && this.querySelector('text');
					const style = text ? text.getAttribute('style') : '';
					return {
						width: style && style.indexOf('\'liga\' 0') >= 0 ? 10 : 20,
						height: 12,
					};
				};
				SVGElement.prototype.getBBox = getBBox;
				SVGSVGElement.prototype.getBBox = getBBox;

				expect(fontTools.classNameToFont('icon-add', 'i')).toEqual({
					tagName: 'i',
					className: 'icon-add',
					font: '12px icon',
				});

				const result = fontTools.fontContentToSvg({
					font: '12px icon',
					content: 'A',
					color: '#000',
				}, function(svg) {
					callbacks.push(svg.nodeName);
				});
				const svg = result && typeof result.then === 'function' ? await result : result;
				expect(svg.nodeName.toLowerCase()).toEqual('svg');
				expect(svg.getAttribute('width')).toEqual('20');
				expect(callbacks).toEqual(['svg']);

				const arrayResult = fontTools.fontContentToSvg({
					font: '12px icon',
					content: ['B', 'C'],
					color: '#000',
				});
				expect(arrayResult.length).toEqual(2);
				const resolved = await Promise.all(arrayResult.map(function(item) {
					return item && typeof item.then === 'function' ? item : Promise.resolve(item);
				}));
				expect(resolved.map(function(item) {
					return item.querySelector('text').textContent;
				})).toEqual(['B', 'C']);

			} finally {
				SVGElement.prototype.getBBox = originalGetBBox;
				SVGSVGElement.prototype.getBBox = originalSvgGetBBox;
			}
		});
	});
})();
