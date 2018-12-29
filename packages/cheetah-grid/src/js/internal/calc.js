'use strict';

const {array: {findIndex}} = require('./utils');

const TYPE_PUNCTURE = 'p';
const TYPE_UNIT = 'u';
const TYPE_OPERATOR = 'o';
const TYPE_NUMBER = 'n';

const NODE_TYPE_UNIT = 'u';
const NODE_TYPE_BINARY_EXPRESSION = 'b';
const NODE_TYPE_NUMBER = 'n';

function createError(calc) {
	return new Error(`calc parse error: ${calc}`);
}

/**
 * tokenize
 * @param {string} calc calc expression
 * @returns {Array} tokens
 * @private
 */
function tokenize(calc) {
	let exp = calc.replace(/calc\(/g, '(');
	const reUnit = /^[-+]?(\d*\.\d+|\d+)[a-z%]+/i;
	const reNum = /^[-+]?(\d*\.\d+|\d+)/i;
	const reOp = /^[-+*/]/;

	const tokens = [];
	let re;
	while ((exp = exp.trim())) {
		if (exp[0] === '(' || exp[0] === ')') {
			tokens.push({value: exp[0], type: TYPE_PUNCTURE});
			exp = exp.slice(1);
		} else if ((re = reUnit.exec(exp))) {
			tokens.push({value: re[0], type: TYPE_UNIT});
			exp = exp.slice(re[0].length);
		} else if ((re = reNum.exec(exp))) {
			tokens.push({value: re[0], type: TYPE_NUMBER});
			exp = exp.slice(re[0].length);
		} else if ((re = reOp.exec(exp))) {
			tokens.push({value: re[0], type: TYPE_OPERATOR});
			exp = exp.slice(re[0].length);
		} else {
			throw createError(calc);
		}
	}
	return tokens;
}

const PRECEDENCE = {
	'*': 3,
	'/': 3,
	'+': 2,
	'-': 2
};

function lex(tokens, calc) {
	function buildBinaryExpNode(stack) {
		const right = stack.pop();
		const op = stack.pop();
		const left = stack.pop();

		if (!left || !left.nodeType ||
			!op || op.type !== TYPE_OPERATOR ||
			!right || !right.nodeType
		) {
			throw createError(calc);
		}
		return {
			nodeType: NODE_TYPE_BINARY_EXPRESSION,
			left,
			op,
			right
		};
	}

	const stack = [];

	while (tokens.length) {
		const token = tokens.shift();
		if (token.type === TYPE_PUNCTURE && token.value === '(') {
			let deep = 0;
			const closeIndex = findIndex(tokens, (t, i) => {
				if (t.type === TYPE_PUNCTURE && t.value === '(') {
					deep++;
				} else if (t.type === TYPE_PUNCTURE && t.value === ')') {
					if (!deep) {
						return true;
					}
					deep--;
				}
				return false;
			});
			if (closeIndex === -1) {
				throw createError(calc);
			}
			stack.push(lex(tokens.slice(0, closeIndex), calc));
			tokens.splice(0, closeIndex + 1);
		} else if (token.type === TYPE_OPERATOR) {
			if (stack.length >= 3) {
				const beforeOp = stack[stack.length - 2].value;
				if (PRECEDENCE[token.value] <= PRECEDENCE[beforeOp]) {
					stack.push(buildBinaryExpNode(stack));
				}
			}
			stack.push(token);
		} else if (token.type === TYPE_UNIT) {
			const {value} = token;
			const num = parseFloat(value);
			const unit = /[a-z%]+/i.exec(value)[0];
			stack.push({
				nodeType: NODE_TYPE_UNIT,
				value: num,
				unit,
			});
		} else if (token.type === TYPE_NUMBER) {
			stack.push({
				nodeType: NODE_TYPE_NUMBER,
				value: parseFloat(token.value)
			});
		}
	}
	while (stack.length > 1) {
		stack.push(buildBinaryExpNode(stack));
	}
	return stack[0];
}

function parse(calcStr) {
	const tokens = tokenize(calcStr);
	return lex(tokens, calcStr);
}

function calcNode(node, context) {
	if (node.nodeType === NODE_TYPE_BINARY_EXPRESSION) {
		const left = calcNode(node.left, context);
		const right = calcNode(node.right, context);

		switch (node.op.value) {
		case '+':
			return left + right;
		case '-':
			return left - right;
		case '*':
			return left * right;
		case '/':
			return left / right;
		default:
			throw new Error(`calc error. unknown operator: ${node.op.value}`);
		}
	} else if (node.nodeType === NODE_TYPE_UNIT) {
		switch (node.unit) {
		case '%':
			return node.value * context.full / 100;
		case 'em':
			return node.value * context.em;
		case 'px':
			return node.value;
		default:
			throw new Error(`calc error. unknown unit: ${node.unit}`);
		}
	} else if (node.nodeType === NODE_TYPE_NUMBER) {
		return node.value;
	}
	throw new Error('calc error.');
}

function toPx(value, context) {
	const ast = parse(value);
	return calcNode(ast, context);
}

module.exports = {
	toPx(value, context) {
		if (typeof value === 'string') {
			return toPx(value.trim(), context);
		}
		return value - 0;
	}
};