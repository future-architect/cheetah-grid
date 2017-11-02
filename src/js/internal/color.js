'use strict';
{
	const rgbMap = {};
	function styleColorToRGB(color) {
		const dummy = document.createElement('div');
		const {style} = dummy;
		style.color = color;
		style.position = 'fixed';
		style.height = '1px';
		style.width = '1px';
		style.opacity = 0;
		document.body.appendChild(dummy);
		const {color: styleColor} = document.defaultView.getComputedStyle(dummy, '');
		document.body.removeChild(dummy);
		return colorToRGB0(styleColor);
	}

	function hexToNum(hex) {
		return parseInt(hex, 16);
	}
	function createRGB(r, g, b, a = 1) {
		return {r, g, b, a};
	}
	function tripleHexToRGB({1: r, 2: g, 3: b}) {
		return createRGB(hexToNum(r + r), hexToNum(g + g), hexToNum(b + b));
	}
	function sextupleHexToRGB({1: r1, 2: r2, 3: g1, 4: g2, 5: b1, 6: b2}) {
		return createRGB(hexToNum(r1 + r2), hexToNum(g1 + g2), hexToNum(b1 + b2));
	}
	
	function testRGB({r, g, b, a}) {
		return 0 <= r && r <= 255 &&
		0 <= g && g <= 255 &&
		0 <= b && b <= 255 &&
		0 <= a && a <= 1;
	}
	function rateToByte(r) {
		return Math.ceil(r * 255 / 100);
	}
	function colorToRGB0(color) {
		if (color.match(/^#[0-9a-f]{3}$/i)) {
			return tripleHexToRGB(color);
		}
		if (color.match(/^#[0-9a-f]{6}$/i)) {
			return sextupleHexToRGB(color);
		}
		let ret = color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
		if (ret) {
			const rgb = createRGB(ret[1] - 0, ret[2] - 0, ret[3] - 0);
			if (testRGB(rgb)) {
				return rgb;
			}
		}
		ret = color.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d(\.\d)?)\s*\)$/i);
		if (ret) {
			const rgb = createRGB(ret[1] - 0, ret[2] - 0, ret[3] - 0, ret[4] - 0);
			if (testRGB(rgb)) {
				return rgb;
			}
		}
		ret = color.match(/^rgb\(\s*(\d{1,3}(\.\d)?)%\s*,\s*(\d{1,3}(\.\d)?)%\s*,\s*(\d{1,3}(\.\d)?)%\s*\)$/i);
		if (ret) {
			const rgb = createRGB(rateToByte(ret[1]), rateToByte(ret[3]), rateToByte(ret[5]));
			if (testRGB(rgb)) {
				return rgb;
			}
		}
		ret = color.match(/^rgba\(\s*(\d{1,3}(\.\d)?)%\s*,\s*(\d{1,3}(\.\d)?)%\s*,\s*(\d{1,3}(\.\d)?)%\s*,\s*(\d(\.\d)?)\s*\)$/i);
		if (ret) {
			const rgb = createRGB(rateToByte(ret[1]), rateToByte(ret[3]), rateToByte(ret[5]), ret[7] - 0);
			if (testRGB(rgb)) {
				return rgb;
			}
		}
		return null;
	}
	function colorToRGB(color) {
		if (typeof color !== 'string') {
			return createRGB(0, 0, 0, 0);
		}
		color = color.toLowerCase().trim();
		if (rgbMap[color]) {
			return rgbMap[color];
		}
		return colorToRGB0(color) || (rgbMap[color] = styleColorToRGB(color));
	}

	module.exports = {
		colorToRGB
	};
}