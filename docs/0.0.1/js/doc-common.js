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