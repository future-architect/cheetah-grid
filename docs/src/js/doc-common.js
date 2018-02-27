'use strict';
const getDropdownOpen = (target) => {
	while (!target.classList.contains('nav-dropdown-button')) {
		target = target.parentElement;
		if (!target) {
			return undefined;
		}
	}
	return target;
};

window.onclick = (event) => {
	const button = getDropdownOpen(event.target);
	if (button) {
		const target = button.getAttribute('data-target');
		document.getElementById(target).classList.toggle('show');
		return;
	}
	if (event.target.classList.contains('nav-dropdown') ||
			event.target.classList.contains('mobile-nav-dropdown')) {
		return;
	}

	const dropdowns = document.querySelectorAll('.nav-dropdown,.mobile-nav-dropdown');
	for (let i = 0; i < dropdowns.length; i++) {
		const openDropdown = dropdowns[i];
		if (openDropdown.classList.contains('show')) {
			openDropdown.classList.remove('show');
		}
	}
};

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

if (!window.debugMode) {
	window.onerror = function(msg, file, line, column, err) {
		getErrorLogElement().value += (err && err.stack) || `${msg}
    at ${file}:${line}:${column}`;
	};
}