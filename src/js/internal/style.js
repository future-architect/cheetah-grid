'use strict';
{
	function getScrollBarWidth() {
		const dummy = document.createElement('div');
		const {style} = dummy;
		style.position = 'absolute';
		style.height = '9999px';
		style.width = 'calc(100vw - 100%)';
		style.opacity = 0;
		dummy.textContent = 'x';
		document.body.appendChild(dummy);
		const {width} = document.defaultView.getComputedStyle(dummy, '');
		document.body.removeChild(dummy);
		return parseInt(width, 10);
	}

	let SCROLLBAR_SIZE;
	const initDocument = () => {
		SCROLLBAR_SIZE = getScrollBarWidth() || 10;
		const style = document.createElement('style');
		style.setAttribute('type', 'text/css');
		style.setAttribute('data-name', 'cheetah-grid');
		style.innerHTML =
		`
.cheetah-grid .grid-scrollable {
	height: 100%;
	width: 100%;
	position: absolute;
	overflow: scroll;
}
.cheetah-grid .grid-scroll-end-point {
	opacity: 0;
	position: relative;
	width: ${SCROLLBAR_SIZE}px;
	height: ${SCROLLBAR_SIZE}px;
}
.cheetah-grid {
	position: relative;
	width: 100%;
	height: 100%;
}
.cheetah-grid > canvas {
	position: absolute;
	width: 0;
	height: 0;
	width: -webkit-calc(100% - ${SCROLLBAR_SIZE}px);
	width: calc(100% - ${SCROLLBAR_SIZE}px);
	height: -webkit-calc(100% - ${SCROLLBAR_SIZE}px);
	height: calc(100% - ${SCROLLBAR_SIZE}px);
}
.cheetah-grid .grid-focus-control {
	position: relative !important;
	width: 1px;
	height: 1px;
	opacity: 0;
	padding: 0;
	margin: 0;
	box-sizing: border-box;
	pointer-events: none;
	max-width: 0;
	max-height: 0;
	float: none !important;
}
.cheetah-grid input.grid-focus-control::-ms-clear,
.cheetah-grid input.input-editor::-ms-clear {
	visibility:hidden;
}
.cheetah-grid .grid-focus-control.composition {
	opacity: 1;
	max-width: none;
	max-height: none;
}
.cheetah-grid__inline-input-editor__input {
	box-sizing: border-box;
}
.cheetah-grid__small-dialog-input-editor-dialog {
	padding: 10px;
	margin: -10px;
	border: solid 1px #ddd;
	box-shadow: 0 7px 8px -4px rgba(0,0,0,.2), 0 13px 19px 2px rgba(0,0,0,.14), 0 5px 24px 4px rgba(0,0,0,.12);
	border-radius: 3px;
	background-color: white;
}
.cheetah-grid__small-dialog-input-editor-dialog__input {
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	border: none;
	border-bottom: solid 1px rgba(0, 0, 0, 0.5);
	outline: none;
	font-size: 16px;
}
.cheetah-grid__small-dialog-input-editor-dialog__input:focus {
	border-bottom: solid 2px #2196f3;
}
.cheetah-grid__small-dialog-input-editor-dialog[data-message],
.cheetah-grid__small-dialog-input-editor-dialog[data-error-message] {
	padding-bottom: 20px;
	margin-bottom: -20px;
}
.cheetah-grid__small-dialog-input-editor-dialog[data-message]::after,
.cheetah-grid__small-dialog-input-editor-dialog[data-error-message]::after {
	font-size: 12px;
	float: right;
	clear: both;
}
.cheetah-grid__small-dialog-input-editor-dialog[data-message]::after {
	content: attr(data-message);
	color: rgba(0, 0, 0, 0.5);
}
.cheetah-grid__small-dialog-input-editor-dialog[data-error-message] input {
	border-bottom: solid 2px rgb(221,44,0);
}
.cheetah-grid__small-dialog-input-editor-dialog[data-error-message]::after {
	content: attr(data-error-message);
	color: rgb(221,44,0);
}
		`;

		document.head.appendChild(style);
	};

	const style = {
		initDocument() {
			style.initDocument = () => {};
			initDocument();
		},
		getScrollBarSize() {
			return SCROLLBAR_SIZE;
		}
	};

	module.exports = style;
}