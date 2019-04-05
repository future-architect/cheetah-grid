'use strict';

var getDropdownOpen = function getDropdownOpen(target) {
	while (!target.classList.contains('nav-dropdown-button')) {
		target = target.parentElement;
		if (!target) {
			return undefined;
		}
	}
	return target;
};

window.onclick = function (event) {
	var button = getDropdownOpen(event.target);
	if (button) {
		var target = button.getAttribute('data-target');
		document.getElementById(target).classList.toggle('show');
		return;
	}
	if (event.target.classList.contains('nav-dropdown') || event.target.classList.contains('mobile-nav-dropdown')) {
		return;
	}

	var dropdowns = document.querySelectorAll('.nav-dropdown,.mobile-nav-dropdown');
	for (var i = 0; i < dropdowns.length; i++) {
		var openDropdown = dropdowns[i];
		if (openDropdown.classList.contains('show')) {
			openDropdown.classList.remove('show');
		}
	}
};

function getErrorLogElement() {
	return document.querySelector('#error_log') || function () {
		var element = document.createElement('textarea');
		element.id = 'error_log';
		element.style.width = '100%';
		element.style.position = 'fixed';
		element.style.bottom = '0';
		element.style['z-index'] = '100';
		element.style.background = '#ddd';
		element.style.color = 'red';
		document.body.appendChild(element);
		return element;
	}();
}

window.onerror = function (msg, file, line, column, err) {
	getErrorLogElement().value += err && err.stack || msg + '\n    at ' + file + ':' + line + ':' + column;
};


var message = document.createElement('div')
message.innerHTML = '<span style="color: rgb(255, 65, 54);">This document has been deprecated. <br>Please move to a <a href="https://future-architect.github.io/cheetah-grid/documents/">new document</a>.</span>'
message.style.backgroundColor = 'rgb(255, 223, 223)'
message.style.position = 'fixed';
message.style.left = 0;
message.style.right = 0;
message.style.top = 0;
message.style.zIndex = 1000;
message.style.textAlign = 'center';
document.body.style.paddingTop = '48px'
document.body.insertBefore(message, document.body.children[0])