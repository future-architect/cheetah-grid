'use strict';

const indexHelper = {
	// デモメニューの構築
	buildDemoContents(data) {
		const nodes = [];
		data.allDemos.forEach(({title, category, order, path, disabled = false}) => {
			if (!Array.isArray(category)) {
				category = [category];
			}
			let last = nodes;
			let obj;
			let level = 0;
			category.forEach((cat) => {
				obj = last.find((e) => e.title === cat);
				if (!obj) {
					obj = {
						title: cat,
						contents: [],
						level,
						disabled: false,
					};
					last.push(obj);
				}
				last = obj.contents;
				level++;
			});
			let content = last.find((e) => e.title === title);
			if (!content) {
				content = {
					title,
					level: category.length,
					contents: []
				};
				last.push(content);
			}
			content.order = order;
			content.path = path;
			content.disabled = disabled;
			
			if (level === 0) {
				last.sort((a, b) => data.demoCategorys.indexOf(a.title) - data.demoCategorys.indexOf(b.title));
			} else {
				last.sort((a, b) => a.order - b.order);
			}
		});
		nodes.sort((a, b) => data.demoCategorys.indexOf(a.title) - data.demoCategorys.indexOf(b.title));
		// console.log(JSON.stringify(nodes, null, '  '));
		return nodes;
	}
};
module.exports = {
	indexHelper,
};