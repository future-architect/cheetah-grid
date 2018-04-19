'use strict';

const {isDef} = require('./utils');

function createElement(tagName, {classList, text, html} = {}) {
	const element = document.createElement(tagName);
	if (classList) {
		if (Array.isArray(classList)) {
			element.classList.add(...classList);
		} else {
			element.classList.add(classList);
		}
	}
	if (text) {
		element.textContent = text;
	} else if (html) {
		element.innerHTML = html;
	}
	return element;
}

function empty(dom) {
	let c;
	while ((c = dom.firstChild)) {
		dom.removeChild(c);
	}
}
function isNode(arg) {
	return !!(arg.nodeType && arg.nodeName);
}
function toNode(arg) {
	if (isNode(arg)) {
		return arg;
	}
	const dom = createElement('div', {html: arg});
	return Array.prototype.slice.call(dom.childNodes);
}
function toNodeList(arg) {
	if ((window.jQuery && arg instanceof window.jQuery)) {
		return Array.prototype.map.call(arg, (a) => a);
	}
	if (Array.isArray(arg)) {
		return arg.map(toNode);
	}
	const node = toNode(arg);
	return Array.isArray(node) ? node : [toNode(arg)];
}

function appendHtml(dom, inner) {
	toNodeList(inner).forEach((node) => {
		dom.appendChild(node);
	});
}

function disableFocus(el) {
	el.dataset.disableBeforeTabIndex = el.tabIndex;
	el.tabIndex = -1;
	Array.prototype.slice.call(el.children, 0).forEach(disableFocus);
}
function enableFocus(el) {
	if ('disableBeforeTabIndex' in el.dataset) {
		el.tabIndex = el.dataset.disableBeforeTabIndex;
	}
	Array.prototype.slice.call(el.children, 0).forEach(enableFocus);
}

function isFocusable(el) {
	return isDef(el.tabIndex) && el.tabIndex > -1;
}
function findPrevSiblingFocusable(el) {
	let n = el.previousSibling;
	while (n && !isFocusable(n)) {
		n = n.previousSibling;
	}
	return n;
}
function findNextSiblingFocusable(el) {
	let n = el.nextSibling;
	while (n && !isFocusable(n)) {
		n = n.nextSibling;
	}
	return n;
}

module.exports = {
	createElement,
	empty,
	isNode,
	toNode,
	toNodeList,
	appendHtml,
	disableFocus,
	enableFocus,
	isFocusable,
	findPrevSiblingFocusable,
	findNextSiblingFocusable,
};