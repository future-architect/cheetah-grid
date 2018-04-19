/*eslint new-cap: "off"*/
'use strict';

function mag(v) {
	return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
}

function dot(u, v) {
	return (u[0] * v[0] + u[1] * v[1]);
}

function ratio(u, v) {
	return dot(u, v) / (mag(u) * mag(v));
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function angle(u, v) {
	let sign = 1.0;
	if ((u[0] * v[1] - u[1] * v[0]) < 0) {
		sign = -1.0;
	}
	return sign * Math.acos(clamp(ratio(u, v)), -1, 1);
}

function rotClockwise(v, angle) {
	const cost = Math.cos(angle);
	const sint = Math.sin(angle);
	return [cost * v[0] + sint * v[1], -1 * sint * v[0] + cost * v[1]];
}

function rotCounterClockwise(v, angle) {
	const cost = Math.cos(angle);
	const sint = Math.sin(angle);
	return [cost * v[0] - sint * v[1], sint * v[0] + cost * v[1]];
}

function midPoint(u, v) {
	return [(u[0] - v[0]) / 2.0, (u[1] - v[1]) / 2.0];
}

function meanVec(u, v) {
	return [(u[0] + v[0]) / 2.0, (u[1] + v[1]) / 2.0];
}

function pointMul(u, v) {
	return [u[0] * v[0], u[1] * v[1]];
}

function scale(c, v) {
	return [c * v[0], c * v[1]];
}

function sum(u, v) {
	return [u[0] + v[0], u[1] + v[1]];
}
// Convert an SVG elliptical arc to a series of canvas commands.
//
// x1, y1, x2, y2: start and stop coordinates of the ellipse.
// rx, ry: radii of the ellipse.
// phi: rotation of the ellipse.
// fA: large arc flag.
// fS: sweep flag.
function ellipseFromEllipticalArc(ctx, x1, y1, rx, ry, phi, fA, fS, x2, y2) {
	// Convert from endpoint to center parametrization, as detailed in:
	//   http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
	if (rx === 0 || ry === 0) {
		ctx.lineTo(x2, x1);
		return;
	}
	phi *= (Math.PI / 180.0);
	rx = Math.abs(rx);
	ry = Math.abs(ry);
	const xPrime = rotClockwise(midPoint(x1, x2), phi); // F.6.5.1
	const xPrime2 = pointMul(xPrime, xPrime);
	let rx2 = Math.pow(rx, 2);
	let ry2 = Math.pow(ry, 2);

	const lambda = Math.sqrt(xPrime2[0] / rx2 + xPrime2[1] / ry2);
	if (lambda > 1) {
		rx *= lambda;
		ry *= lambda;
		rx2 = Math.pow(rx, 2);
		ry2 = Math.pow(ry, 2);
	}
	let factor = Math.sqrt(Math.abs(rx2 * ry2 - rx2 * xPrime2[1] - ry2 * xPrime2[0]) /
														(rx2 * xPrime2[1] + ry2 * xPrime2[0]));
	if (fA === fS) {
		factor *= -1.0;
	}
	const cPrime = scale(factor, [rx * xPrime[1] / ry, -ry * xPrime[0] / rx]); // F.6.5.2
	const c = sum(rotCounterClockwise(cPrime, phi), meanVec(x1, x2)); // F.6.5.3
	const x1UnitVector = [(xPrime[0] - cPrime[0]) / rx, (xPrime[1] - cPrime[1]) / ry];
	const x2UnitVector = [(-1.0 * xPrime[0] - cPrime[0]) / rx, (-1.0 * xPrime[1] - cPrime[1]) / ry];
	const theta = angle([1, 0], x1UnitVector); // F.6.5.5
	const deltaTheta = angle(x1UnitVector, x2UnitVector); // F.6.5.6
	const start = theta;
	const end = theta + deltaTheta;
	ctx.save();
	ctx.translate(c[0], c[1]);
	ctx.rotate(phi);
	ctx.scale(rx, ry);
	ctx.arc(0, 0, 1, start, end, 1 - fS);
	ctx.restore();
}

class PathCommands {
	constructor(ctx) {
		let lMx;
		let lMy;
		let lx = 0;
		let ly = 0;
		let reflected;
		let lastCommand = '';
		function makeReflected() {
			if ('CcSsQqTt'.indexOf(lastCommand) < 0) {
				return {x: lx, y: ly};
			}
			return reflected;
		}

		this.M = (px, py) => {
			ctx.moveTo(px, py);
			lMx = px;
			lMy = py;
			lx = px;
			ly = py;
			lastCommand = 'M';
			return this;
		};
		this.m = (px, py) => this.M(px + lx, py + ly);
		this.L = (px, py) => {
			ctx.lineTo(px, py);
			lx = px;
			ly = py;
			lastCommand = 'L';
			return this;
		};
		this.l = (px, py) => this.L(px + lx, py + ly);
		this.H = (px) => this.L(px, ly);
		this.h = (px) => this.H(px + lx);
		this.V = (py) => this.L(lx, py);
		this.v = (py) => this.V(py + ly);
		this.Z = () => {
			ctx.closePath();
			lx = lMx;
			ly = lMy;
			lastCommand = 'Z';
			return this;
		};
		this.z = () => this.Z();
		//C x1 y1, x2 y2, x y (or c dx1 dy1, dx2 dy2, dx dy)
		this.C = (cp1x, cp1y, cp2x, cp2y, px, py) => {
			ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, px, py);
			lx = px;
			ly = py;
			reflected = {
				x: 2 * px - cp2x,
				y: 2 * py - cp2y,
			};
			lastCommand = 'C';
			return this;
		};
		this.c = (cp1x, cp1y, cp2x, cp2y, px, py) => this.C(
				cp1x + lx, cp1y + ly,
				cp2x + lx, cp2y + ly,
				px + lx, py + ly
		);
		//S x2 y2, x y (or s dx2 dy2, dx dy)
		this.S = (cpx, cpy, px, py) => {
			const {x: cp1x, y: cp1y} = makeReflected(lastCommand);
			return this.C(cp1x, cp1y, cpx, cpy, px, py);
		};
		this.s = (cpx, cpy, px, py) => this.S(cpx + lx, cpy + ly, px + lx, py + ly);
		//Q x1 y1, x y (or q dx1 dy1, dx dy)
		this.Q = (cpx, cpy, px, py) => {
			ctx.quadraticCurveTo(cpx, cpy, px, py);
			lx = px;
			ly = py;
			reflected = {
				x: 2 * px - cpx,
				y: 2 * py - cpy,
			};
			lastCommand = 'Q';
			return this;
		};
		this.q = (cpx, cpy, px, py) => this.Q(cpx + lx, cpy + ly, px + lx, py + ly);
		//T x y (or t dx dy)
		this.T = (px, py) => {
			const {x: cpx, y: cpy} = makeReflected();
			return this.Q(cpx, cpy, px, py);
		};
		this.t = (px, py) => this.T(px + lx, py + ly);
		//A rx ry x-axis-rotation large-arc-flag sweep-flag x y
		this.A = (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py) => {
			const x1 = lx;
			const y1 = ly;

			ellipseFromEllipticalArc(ctx, x1, y1, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py);

			lx = px;
			ly = py;
			lastCommand = 'A';
			return this;
		};
		//a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
		this.a = (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py) => this.A(
				rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px + lx, py + ly);

	}
}

module.exports = PathCommands;