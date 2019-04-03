'use strict';

const PathCommandsParser = require('./PathCommandsParser');
const parser = new PathCommandsParser();

class Path2D {
	constructor(arg) {
		this._ops = [];
		[
			'closePath',
			'moveTo',
			'lineTo',
			'bezierCurveTo',
			'quadraticCurveTo',
			'arc',
			'rect'
		].forEach((name) => {
			this[name] = (...args) => {
				this._ops.push({op: name, args});
			};
		});
		if (arg === undefined) {
			return;
		}
		if (typeof arg === 'string') {
			// try {
			this._ops = parser.parse(arg);
			// } catch (e) {
			// 	throw e;
			// }
		} else if (arg.hasOwnProperty('_ops')) {
			this._ops = [...this._ops];
		} else {
			throw new Error(`Error: ${typeof arg} is not a valid argument to Path`);
		}
	}
}

const {CanvasRenderingContext2D} = window;

const originalFill = CanvasRenderingContext2D.prototype.fill;

CanvasRenderingContext2D.prototype.fill = function(...args) {
	if (args[0] instanceof Path2D) {
		const path = args[0];
		this.beginPath();
		path._ops.forEach((op) => {
			this[op.op](...op.args);
		});
		originalFill.apply(this, Array.prototype.slice.call(args, 1));
	} else {
		originalFill.apply(this, args);
	}
};

module.exports = Path2D;
