'use strict';


const path = require('path');
const Handlebars = require('handlebars');
const marked = require('marked');
const babel = require('babel-core');
const highlightjs = require('highlight.js');
const vueCompiler = require('vue-template-compiler');
const crypto = require('crypto');

module.exports = registerHelpers;


function analyzeArguments(...args) {
	const option = args.pop();
	const get = option.fn || (args.length === 1 ? () => args[0] : () => new Error('empty inner'));
	return {
		args,
		option,
		hash: option.hash || {},
		get,
		fn: option.fn,
	};
}

function registerHelpers() {
	/**
	 * metalsmithの出力先からのPATH取得
	 */
	Handlebars.registerHelper('ms_path', (text, ...args) => {
		const paths = [];
		args[args.length - 1].data.root.path.replace(/\\/g, '/').split('/').forEach((p) => {
			if (p) {
				paths.push(p === '.' ? '.' : '..');
			}
		});
		paths.pop();
		const path = paths.length ? `./${paths.join('/')}/${text}` : `./${text}`;
		return new Handlebars.SafeString(path.replace(/\\/g, '/'));
	});
	/**
	 * metalsmithで最終的に適用されるpath
	 */
	Handlebars.registerHelper('ms_finalpath', (filepath) => {
		let last = filepath;
		let ext;
		while ((ext = path.extname(filepath))) {
			last = filepath;
			filepath = filepath.slice(0, -ext.length);
		}
		return last.replace(/\\/g, '/');
	});

	Handlebars.registerHelper('ms_breadcrumb', function(categorys, opt) {
		function arraysEqual(a, b) {
			if (a === b) { return true; }
			if (!a || !b) { return false; }
			if (a.length !== b.length) { return false; }
			for (let i = 0; i < a.length; ++i) {
				if (a[i] !== b[i]) { return false; }
			}
			return true;
		}
		if (!Array.isArray(categorys)) {
			categorys = [categorys];
		}

		const {allDemos} = opt.data.root.collections;
		const tree = [];

		return categorys.map((category) => {
			tree.push(category);
			const demo = allDemos.find((demo) => {
				const demoCategorys = Array.isArray(demo.category) ? demo.category : [demo.category];
				return arraysEqual([...demoCategorys, demo.title], tree);
			});
			if (!demo || !demo.path) {
				if (tree.length === 1) {
					const path = Handlebars.helpers.ms_path.call(
							this, Handlebars.helpers.ms_finalpath.call(this, './index.html', opt), opt
					);
					const hash = (`${category}`).toLowerCase().replace(/ /g, '-');
					return `<a href="${path}#${hash}">${category}</a>`;
				}
				return category;
			}
			const path = Handlebars.helpers.ms_path.call(
					this, Handlebars.helpers.ms_finalpath.call(this, demo.path, opt), opt
			);

			return `<a href="${path}">${category}</a>`;
		}).join(' &gt; ');
	});

	Handlebars.registerHelper('concat', (...args) => {
		args.pop();
		return args.join('');
	});
	Handlebars.registerHelper('includes', (s, search) => s.includes(search));


	Handlebars.registerHelper('texttrim', (s) => {
		if (!s) {
			return s;
		}
		const ss = s.split(/\r\n|\r|\n/);
		if (ss.length === 1) {
			return s.trim();
		}
		while (ss.length && !ss[0].trim()) {
			ss.shift();
		}
		while (ss.length && !ss[ss.length - 1].trim()) {
			ss.pop();
		}
		return ss.join('\n');
	});
	Handlebars.registerHelper('lookups', (obj, ...props) => {
		props.pop();
		props.forEach((p) => {
			obj = obj[p];
		});
		return obj;
	});
	Handlebars.registerHelper('or', (...args) => {
		args.pop();
		for (let i = 0; i < args.length; i++) {
			if (args[i]) {
				return args[i];
			}
		}
		return false;
	});
	Handlebars.registerHelper('eq', (...args) => {
		args.pop();
		const a = args.pop();
		for (const b of args) {
			if (a !== b) {
				return false;
			}
		}
		return true;
	});
	Handlebars.registerHelper('remove', (arg) => {
		if (arg.fn) {
			arg.fn(this);
		}
		return '';
	});

	Handlebars.registerHelper('range', function(start, end, options) {
		const list = [];
		for (let i = start; i <= end; i++) {
			list.push(i);
		}
		return Handlebars.helpers.each.
			call(this, list, {fn: options.fn, inverse: options.inverse, hash: options.hash});
	});

	Handlebars.registerHelper('tree_each', function(context, childrenName, options) {

		function childEach(ctx) {
			if (!ctx) {
				return '';
			}
			const children = ctx[childrenName];
			if (children) {
				return Handlebars.helpers.tree_each.
					call(this, children, childrenName, {fn: options.fn, inverse: options.inverse, hash: options.hash});
			}
			return '';
		}

		return Handlebars.helpers.each.
			call(this, context, {
				fn(ctx, opt) {
					return options.fn.call(this, ctx, opt) + childEach.call(this, ctx);
				},
				inverse(ctx, opt) {
					return options.inverse.call(this, ctx, opt) + childEach.call(this, ctx);
				},
				hash: options.hash
			});
	});
	Handlebars.registerHelper('eval', (...args) => {
		const arg = analyzeArguments(...args);
		const context = arg.get(this);
		const {option} = arg;
		const ret = (function() {
			return eval('(() => {' + // eslint-disable-line no-eval
				`${context}
			})()`);
		}).bind(option.data.root)();// eslint-disable-line no-extra-bind
		if (args.length > 1) {
			option.data.root[args[0]] = ret;
			return '';
		} else {
			return ret;
		}
	});
	/**
	 * 変数に格納するhelper
	 * （元のデータは削除します）
	 * ex.
	 * ---
	 * {{var "name" "data"}} => root: {name: 'data'}
	 * ---
	 * {{#var "name"}}data{{/var}} => root: {name: 'data'}
	 *
	 */
	Handlebars.registerHelper('var', function(name, ...args) {
		Handlebars.helpers.copy.call(this, name, ...args);
		return '';
	});
	/**
	 * 内容をコピーして変数に格納するhelper
	 * ex.
	 * ---
	 * {{copy "name" "data"}} => root: {name: 'data'} / render "data"
	 * ---
	 * {{#copy "name"}}data{{/copy}} => root: {name: 'data'} / render "data"
	 *
	 */
	Handlebars.registerHelper('copy', function(name, ...args) {
		if (args.length <= 0) {
			return undefined;
		}
		const arg = analyzeArguments(...args);
		let contexts = [...arg.args];
		if (Object.keys(arg.hash) > 0) {
			contexts.push(arg.hash);
		}
		if (arg.fn) {
			contexts.push(arg.fn(this));
		}
		contexts = contexts.filter((o) => !!o);
		if (contexts.length === 1) {
			contexts = contexts[0];
		}
		const {option} = arg;
		return (option.data.root[name] = contexts);
	});
	/**
	 * マークダウン変換するhelper
	 * ex.
	 * ---
	 * {{#marked}}### title{{/marked}} => <h3>title</h3>
	 * ---
	 */
	Handlebars.registerHelper('marked', function(...args) {
		const arg = analyzeArguments(...args);
		const context = arg.get(this);
		const option = Object.assign({sanitize: true}, arg.hash);
		return new Handlebars.SafeString(marked(context, option));
	});
	/**
	 * es6からes5にトランスパイルするhelper
	 * ex.
	 * <script type="text/javascript">
	 * //{{#babel}}
	 * 'use strict';
	 * //ES6
	 * const str = 'handlebars';
	 * const data = `hello ${str}`;
	 * const obj = {data};
	 * const {data: res} = obj;
	 * console.log(JSON.stringify(res));
	 * //{{/babel}}
	 * </script>
	 * ↓
	 * <script type="text/javascript">
	 * //
	 * 'use strict';
	 * //ES6
	 *
	 * var str = 'handlebars';
	 * var data = 'hello ' + str;
	 * var obj = { data: data };
	 * var res = obj.data;
	 *
	 * console.log(JSON.stringify(res));
	 * //
	 * </script>
	 *
	 */
	Handlebars.registerHelper('babel', function(...args) {
		const arg = analyzeArguments(...args);
		const context = arg.get(this);
		const option = Object.assign({presets: ['env']}, arg.hash);
		return `//babel\n${babel.transform(context, option).code}`;
	});
	Handlebars.registerHelper('vue', function(...args) {
		const arg = analyzeArguments(...args);
		const context = arg.get(this);
		const output = vueCompiler.parseComponent(context, {pad: 'line'});
		const template = output.template.content;
		const script = babel.transform(output.script.content, {presets: ['env']}).code;

		const md5hash = crypto.createHash('md5');
		md5hash.update(`${template}/${script}`, 'binary');
		const id = `vue${md5hash.digest('hex')}`;
		return new Handlebars.SafeString(`
<div id="${id}"></div>
<script type="text/javascript">
(function() {
	var exports = {};
	(function(exports) {
		${script}
	})(exports)
	var obj = exports.default || exports
	obj.template = ${JSON.stringify(template)}
	var vm = new Vue(obj);
	vm.$mount('#${id}')
})();
</script>
`);
	});
	Handlebars.registerHelper('hbs', function(...args) {
		const arg = analyzeArguments(...args);
		const context = arg.get(this);
		const option = Object.assign({}, arg.hash);
		const template = Handlebars.compile(context);
		return template(option);
	});
	Handlebars.registerHelper('highlightjs', function(...args) {
		const arg = analyzeArguments(...args);
		const context = arg.get(this);
		const option = Object.assign({'class': 'js'}, arg.hash);

		const result = highlightjs.highlight(option.class, context, true);

		return `<!-- highlightjs -->\n${result}`;
	});


	Handlebars.registerHelper('wrapscript', function(...args) {
		const script = Handlebars.helpers.babel.call(this, ...args);
		return `//wrapscript\n(function() {\n${script}\n})();`;
	});
	Handlebars.registerHelper('code', function(...args) {
		const arg = analyzeArguments(...args);
		const option = Object.assign({class: 'js'}, arg.hash);
		option.code = arg.get(this);
		let template;
		if (typeof Handlebars.partials.code !== 'function') {
			template = Handlebars.compile(Handlebars.partials.code);
		} else {
			template = Handlebars.partials.code;
		}

		return new Handlebars.SafeString(template(option));
	});
	Handlebars.registerHelper('json', function(...args) {
		const arg = analyzeArguments(...args);
		const code = arg.get(this);
		const result = JSON.parse(code);
		const {option} = arg;
		arg.args.forEach((name) => {
			option.data.root[name] = result;
		});
	});
	/**
	 * リンク生成helper
	 */
	Handlebars.registerHelper('link', (url, label) => {
		if (!path.extname(url)) {
			url += '/index.html';
		}
		return new Handlebars.SafeString(`<a href="${url}">${label}</a>`);
	});
	/**
	 * リンク生成helper
	 */
	Handlebars.registerHelper('md_link', (url, label) => {
		if (!path.extname(url)) {
			url += '/index.html';
		}
		return `[${label}](${url})`;
	});
	/**
	 * バージョン判定ブロック
	 */
	Handlebars.registerHelper('if_v', function(v, ...args) {
		const {isEnabledVersion} = require('../buildcommon');
		return Handlebars.helpers.if.call(this, isEnabledVersion(v), ...args);
	});
}

