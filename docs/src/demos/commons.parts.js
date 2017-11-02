
/*global cheetahGrid, grid*/
/*eslint no-unused-vars:0*/
'use strict';
function getErrorLogElement() {
	return document.querySelector('#error_log') || (() => {
		const element = document.createElement('textarea');
		element.id = 'error_log';
		element.style.width = '100%';
		element.style.position = 'fixed';
		element.style.bottom = '0';
		element.style['z-index'] = '100';
		element.style.background = '#ddd';
		element.style.color = 'red';
		document.body.appendChild(element);
		return element;
	})();
}

window.onerror = function(msg, file, line, column, err) {
	getErrorLogElement().value += (err && err.stack) || `${msg}
    at ${file}:${line}:${column}`;
};