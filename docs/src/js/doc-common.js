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