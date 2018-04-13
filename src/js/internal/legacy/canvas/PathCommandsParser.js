'use strict';

const PathCommands = require('./PathCommands');

function pathTokens(d) {
	let idx = 0;
	return {
		next() {
			let s = '';
			while (d.length > idx) {
				const c = d[idx];
				idx++;
				if (' ,\n\r\t'.indexOf(c) > -1) {
					if (s) {
						return s;
					}
				} else {
					const type = '.+-1234567890'.indexOf(c) > -1 ? 'num' : 'str';
					if (type === 'str') {
						if (s) {
							idx--;
							return s;
						}
						return c;
					}
					if ('-+'.indexOf(c) > -1) {
						if (s) {
							idx--;
							return s;
						}
					}
					if (c === '.') {
						if (s.indexOf('.') > -1) {
							idx--;
							return s;
						}
					}
					s += c;
				}
			}
			return s || null;
		}
	};
}

function command(builder, cmd, argsProvider) {
	if (cmd.toUpperCase() === 'M' || cmd.toUpperCase() === 'L' || cmd.toUpperCase() === 'T') {
		builder.command(cmd, argsProvider.next(), argsProvider.next());
		return cmd === 'M' ? 'L'
			: cmd === 'm' ? 'l'
			: cmd;
	} else if (cmd.toUpperCase() === 'H' || cmd.toUpperCase() === 'V') {
		builder.command(cmd, argsProvider.next());
		return cmd;
	} else if (cmd.toUpperCase() === 'Z') {
		builder.command(cmd);
		return cmd;
	} else if (cmd.toUpperCase() === 'C') {
		builder.command(cmd,
				argsProvider.next(), argsProvider.next(),
				argsProvider.next(), argsProvider.next(),
				argsProvider.next(), argsProvider.next()
		);
		return cmd;
	} else if (cmd.toUpperCase() === 'S' || cmd.toUpperCase() === 'Q') {
		builder.command(cmd,
				argsProvider.next(), argsProvider.next(),
				argsProvider.next(), argsProvider.next()
		);
		return cmd;
	} else if (cmd.toUpperCase() === 'A') {
		builder.command(cmd,
				argsProvider.next(), argsProvider.next(),
				argsProvider.next(), argsProvider.next(), argsProvider.next(),
				argsProvider.next(), argsProvider.next()
		);
		return cmd;
	} else {
		// https://developer.mozilla.org/ja/docs/Web/SVG/Tutorial/Paths
		console.warn(`unsupported:${cmd}`);
	}
	return null;
}

const canvasOperations = window.CanvasRenderingContext2D ? Object.keys(window.CanvasRenderingContext2D.prototype) : [
	'save',
	'restore',
	'beginPath',
	'closePath',
	'moveTo',
	'lineTo',
	'bezierCurveTo',
	'quadraticCurveTo',
	'arc',
	'arcTo',
	'ellipse',
	'rect',
	'translate',
	'rotate',
	'scale',
];

class PathCommandsParser {
	constructor() {
		this._commands = new PathCommands(this);
		canvasOperations.forEach((op) => {
			this[op] = (...args) => {
				this._ops.push({
					op,
					args,
				});
			};
		});
	}
	command(name, ...args) {
		args = args || [];
		for (let i = 0; i < args.length; i++) {
			args[i] -= 0;
		}
		this._commands[name](...(args));
	}
	parse(d) {
		const ops = this._ops = [];
		const tokens = pathTokens(d);
		try {
			let cmd;
			let subsequentCommand;
			while ((cmd = tokens.next())) {
				if (!isNaN(cmd - 0)) {
					let fst = true;
					const argsProvider = {
						next() {
							if (fst) {
								fst = false;
								return cmd;
							}
							return tokens.next();
						}
					};
					subsequentCommand = command(this, subsequentCommand, argsProvider);
				} else {
					subsequentCommand = command(this, cmd, tokens);
				}
			}
		} catch (e) {
			console.log(`Error: ${d}`);
			throw e;
		}
		return ops;
	}
}

module.exports = PathCommandsParser;