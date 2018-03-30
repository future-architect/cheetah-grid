/*eslint-env es6*/
/*eslint prefer-arrow-callback:"off", object-shorthand:"off", prefer-rest-params:"off", complexity: "off", prefer-destructuring: "off" */
'use strict';
(function() {
	//エラーをconsoleに
	if (!window.__karma__) {
		jasmine.getEnv().addReporter({
			specDone: function(result) {
				if (result.failedExpectations.length) {
					console.error(result.failedExpectations[0].stack);
				}
			},
		});
	}
	const getScript = function() {
		const scripts = document.getElementsByTagName('script');
		return scripts[scripts.length - 1];
	};

	const getPath = function(url) {
		const m = url.match('(^.*)[?#]');
		return m ? m[1] : url;
	};

	window.getScriptURL = function() {
		let at = getScript().src;
		at = getPath(at);
		return at;
	};

	window.createCanvasHelper = function(width, height) {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const prev = document.body.firstChild;
		document.body.insertBefore(canvas, prev);
		const context = canvas.getContext('2d', {alpha: false});
		return {
			canvas: canvas,
			context: context,
			fillRect: function(color, x, y, width, height) {
				color = color || 'white';
				x = x || 0;
				y = y || 0;
				width = width || canvas.width;
				height = height || canvas.height;

				context.beginPath();
				context.fillStyle = color;
				context.rect(x, y, width, height);
				context.fill();
			},
			createGridHelper: function(cols, rows) {
				function getRect(col1, row1, col2, row2) {
					col2 = col2 || col1;
					row2 = row2 || row1;
					let left = 0;
					let c;
					for (c = 0; c < col1; c++) {
						left += cols[c];
					}
					let width = 0;
					for (c = col1; c < col2 + 1; c++) {
						width += cols[c];
					}
					let top = 0;
					let r;
					for (r = 0; r < row1; r++) {
						top += rows[r];
					}
					let height = 0;
					for (r = row1; r < row2 + 1; r++) {
						height += rows[r];
					}
					return {
						left: left,
						width: width,
						right: left + width,
						top: top,
						height: height,
						bottom: top + height,
					};
				}
				const helper = {
					getRect: function(col1, row1, col2, row2) {
						return getRect(col1, row1, col2 || col1, row2 || row1);
					},
					fillRect: function(color, col1, row1, col2, row2) {
						color = color || 'white';
						col1 = col1 || 0;
						row1 = row1 || 0;
						col2 = (col2 === null || col2 === undefined) ? cols.length - 1 : col2;
						row2 = (row2 === null || row2 === undefined) ? rows.length - 1 : row2;

						const rect = getRect(col1, row1, col2, row2);

						context.beginPath();
						context.fillStyle = color;
						context.rect(rect.left, rect.top, rect.width, rect.height);
						context.fill();
					},
					text: function(text, col, row, option) {
						option = option || {};
						const r = getRect(col, row);
						context.save();
						//clip
						context.beginPath();
						context.rect(r.left, r.top, r.width, r.height);
						context.clip();

						const textAlign = option.textAlign || 'left';
						const textBaseline = option.textBaseline || 'top';
						context.textAlign = textAlign;
						context.textBaseline = textBaseline;
						let x = option.x;
						if (!x) {
							const offsetX = (option.offsetX || option.offset || 0);
							x = r.left + offsetX;
							if (textAlign === 'right' || textAlign === 'end') {
								x = r.right - offsetX;
							} else if (textAlign === 'center') {
								x = r.left + (r.width / 2);
							}
						}
						let y = option.y;
						if (!y) {
							const offsetY = (option.offsetY || option.offset || 0);
							y = r.top + offsetY;
							if (textBaseline === 'bottom' || textBaseline === 'alphabetic' || textBaseline === 'ideographic') {
								y = r.bottom - offsetY;
							} else if (textBaseline === 'middle') {
								y = r.top + (r.height / 2);
							}
						}

						context.fillText(text, x, y);

						context.restore();

					},
					lineAll: function(width) {
						helper.lineAllH(width);
						helper.lineAllV(width);
					},
					lineAllH: function(width, col1, col2) {
						for (let row = 0; row < rows.length; row++) {
							helper.lineH(width, row, col1, col2, true);
						}
					},
					lineAllV: function(width, row1, row2) {
						for (let col = 0; col < cols.length; col++) {
							helper.lineV(width, col, row1, row2, true);
						}
					},
					lineH: function(width, row, col1, col2, drawBottom) {
						col1 = col1 || 0;
						col2 = (col2 === null || col2 === undefined) ? cols.length - 1 : col2;
						context.lineWidth = width || 1;
						const r = getRect(col1, row, col2, row);
						let top = r.top;
						const left = r.left;
						const right = r.right;
						let bottom = r.bottom;


						if (!drawBottom) {
							top += context.lineWidth / 2;
							context.beginPath();
							context.moveTo(left, top);
							context.lineTo(right, top);
							context.stroke();
						} else {
							bottom -= context.lineWidth / 2;
							context.beginPath();
							context.moveTo(left, bottom);
							context.lineTo(right, bottom);
							context.stroke();
						}
					},
					lineV: function(width, col, row1, row2, drawRight) {
						row1 = row1 || 0;
						row2 = (row2 === null || row2 === undefined) ? rows.length - 1 : row2;
						context.lineWidth = width || 1;
						const r = getRect(col, row1, col, row2);
						const top = r.top;
						const bottom = r.bottom;
						let left = r.left;
						let right = r.right;

						if (!drawRight) {
							left += context.lineWidth / 2;
							context.beginPath();
							context.moveTo(left, top);
							context.lineTo(left, bottom);
							context.stroke();
						} else {
							right -= context.lineWidth / 2;
							context.beginPath();
							context.moveTo(right, top);
							context.lineTo(right, bottom);
							context.stroke();

						}
					}
				};
				return helper;
			}

		};
	};

	const ua = navigator.userAgent.toLowerCase();
	const ver = navigator.appVersion.toLowerCase();

	// IE(11以外)
	const isMSIE = (ua.indexOf('msie') > -1) && (ua.indexOf('opera') === -1);
	// IE6
	const isIE6 = isMSIE && (ver.indexOf('msie 6.') > -1);
	// IE7
	const isIE7 = isMSIE && (ver.indexOf('msie 7.') > -1);
	// IE8
	const isIE8 = isMSIE && (ver.indexOf('msie 8.') > -1);
	// IE9
	const isIE9 = isMSIE && (ver.indexOf('msie 9.') > -1);
	// IE10
	const isIE10 = isMSIE && (ver.indexOf('msie 10.') > -1);
	// IE11
	const isIE11 = (ua.indexOf('trident/7') > -1);
	// IE
	const isIE = isMSIE || isIE11;
	// Edge
	const isEdge = (ua.indexOf('edge') > -1);

	// Google Chrome
	const isChrome = (ua.indexOf('chrome') > -1) && (ua.indexOf('edge') === -1);
	// Firefox
	const isFirefox = (ua.indexOf('firefox') > -1);
	// Safari
	const isSafari = (ua.indexOf('safari') > -1) && (ua.indexOf('chrome') === -1) && (ua.indexOf('phantomjs') === -1);
	// Opera
	const isOpera = (ua.indexOf('opera') > -1);

	const isPhantomjs = (ua.indexOf('phantomjs') > -1);


	if (isIE) {
		window.userBrowser = 'IE';
	}
	if (isIE6) {
		window.userBrowser = 'IE6';
	}
	if (isIE7) {
		window.userBrowser = 'IE7';
	}
	if (isIE8) {
		window.userBrowser = 'IE8';
	}
	if (isIE9) {
		window.userBrowser = 'IE9';
	}
	if (isIE10) {
		window.userBrowser = 'IE10';
	}
	if (isIE11) {
		window.userBrowser = 'IE11';
	}
	if (isEdge) {
		window.userBrowser = 'Edge';
	}

	if (isChrome) {
		window.userBrowser = 'Chrome';
	}
	if (isFirefox) {
		window.userBrowser = 'Firefox';
	}
	if (isSafari) {
		window.userBrowser = 'Safari';
	}
	if (isOpera) {
		window.userBrowser = 'Opera';
	}
	if (isPhantomjs) {
		window.userBrowser = 'PhantomJS';
	}


})();