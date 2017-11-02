'use strict';

const {isDef, array: {isArray}} = require('./utils');

const ICON_PROP_KEYS = [
	'content',
	'font',
	'color',
	'className',
	'isLiga',
	'width',
	'src',
	'svg',
	'name',
];

function quote(name) {
	const quoted = [];
	const split = name.split(/,\s*/);
	for (let i = 0; i < split.length; i++) {
		const part = split[i].replace(/['"]/g, '');
		if (part.indexOf(' ') === -1 && !(/^\d/.test(part))) {
			quoted.push(part);
		} else {
			quoted.push('\'' + part + '\'');
		}
	}
	return quoted.join(',');
}

const doms = {};
const props = {};

function getIconProps(tagName, className) {
	const tagProps = props[tagName] || (props[tagName] = {});
	if (tagProps[className]) {
		return tagProps[className];
	}
	const dom = doms[tagName] || (doms[tagName] = document.createElement(tagName));
	dom.className = className;
	document.body.appendChild(dom);
	try {
		const beforeStyle = document.defaultView.getComputedStyle(dom, '::before');
		let content = beforeStyle.getPropertyValue('content');
		if (content.length >= 3 && (content[0] === '"' || content[0] === '\'')) {
			if (content[0] === content[content.length - 1]) {
				content = content.substr(1, content.length - 2);
			}
		}
		let font = beforeStyle.getPropertyValue('font');
		if (!font) {
			font = beforeStyle.getPropertyValue('font-style') + ' ' +
				beforeStyle.getPropertyValue('font-variant') + ' ' +
				beforeStyle.getPropertyValue('font-weight') + ' ' +
				beforeStyle.getPropertyValue('font-size') + '/' +
				beforeStyle.getPropertyValue('line-height') + ' ' +
				quote(beforeStyle.getPropertyValue('font-family'));
		}
		const color = beforeStyle.getPropertyValue('color');
		const width = dom.clientWidth;
		const isLiga = (beforeStyle.getPropertyValue('font-feature-settings') || '').indexOf('liga') > -1;
		
		return (tagProps[className] = {
			content,
			font,
			color,
			width,
			isLiga,
		});
	} finally {
		document.body.removeChild(dom);
	}
}

function toPropArray(prop, count) {
	const result = [];
	if (isArray(prop)) {
		result.push(...prop);
		for (let i = prop.length; i < count; i++) {
			result.push(null);
		}
	} else {
		for (let i = 0; i < count; i++) {
			result.push(prop);
		}
	}
	return result;
}

function toSimpleArray(iconProps) {
	if (!iconProps) {
		return iconProps;
	} else if (isArray(iconProps)) {
		return iconProps;
	}

	const workData = {};

	let count = 0;
	ICON_PROP_KEYS.forEach((k) => {
		if (iconProps[k]) {
			if (isArray(iconProps[k])) {
				count = Math.max(count, iconProps[k].length);
			} else {
				count = Math.max(count, 1);
			}
		}
	});

	ICON_PROP_KEYS.forEach((k) => {
		workData[k] = toPropArray(iconProps[k], count);
	});

	const result = [];
	for (let i = 0; i < count; i++) {
		const data = {};
		ICON_PROP_KEYS.forEach((k) => {
			data[k] = workData[k][i];
		});
		result.push(data);
	}
	return result;
}

function normarize(iconProps) {
	const data = {};
	for (const k in iconProps) {
		if (k === 'className') {
			continue;
		}
		data[k] = iconProps[k];
	}
	if (iconProps.className) {
		const prop = getIconProps(iconProps.tagName || 'i', iconProps.className);
		for (const k in prop) {
			if (!isDef(iconProps[k])) {
				data[k] = prop[k];
			}
		}
	}
	return data;
}

module.exports = {
	toNormarizeArray(iconProps) {
		const icons = toSimpleArray(iconProps);
		if (!icons) {
			return icons;
		}
		return icons.map((icon) => normarize(icon));
	},
	get iconPropKeys() {
		return ICON_PROP_KEYS;
	},
	getIconProps,
};


