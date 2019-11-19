import { array } from "./utils";

const TYPE_PUNCTURE = "p";
const TYPE_UNIT = "u";
const TYPE_OPERATOR = "o";
const TYPE_NUMBER = "n";

const NODE_TYPE_UNIT = "u";
const NODE_TYPE_BINARY_EXPRESSION = "b";
const NODE_TYPE_NUMBER = "n";

type Ops = "-" | "+" | "*" | "/";
type PuncToken = {
  value: string;
  type: typeof TYPE_PUNCTURE;
};
type UnitToken = {
  value: string;
  type: typeof TYPE_UNIT;
};
type OpToken = {
  value: Ops;
  type: typeof TYPE_OPERATOR;
};
type NumToken = {
  value: string;
  type: typeof TYPE_NUMBER;
};
type Token = PuncToken | UnitToken | OpToken | NumToken;
type UnitNode = {
  nodeType: typeof NODE_TYPE_UNIT;
  unit: string;
  value: number;
};
type BinaryNode = {
  nodeType: typeof NODE_TYPE_BINARY_EXPRESSION;
  left: Node;
  op: OpToken;
  right: Node;
};
type NumNode = {
  nodeType: typeof NODE_TYPE_NUMBER;
  value: number;
};
type Node = UnitNode | BinaryNode | NumNode;

function createError(calc: string): Error {
  return new Error(`calc parse error: ${calc}`);
}

/**
 * tokenize
 * @param {string} calc calc expression
 * @returns {Array} tokens
 * @private
 */
function tokenize(calc: string): Token[] {
  let exp = calc.replace(/calc\(/g, "(");
  const reUnit = /^[-+]?(\d*\.\d+|\d+)[a-z%]+/i;
  const reNum = /^[-+]?(\d*\.\d+|\d+)/i;
  const reOp = /^[-+*/]/;

  const tokens: Token[] = [];
  let re;
  while ((exp = exp.trim())) {
    if (exp[0] === "(" || exp[0] === ")") {
      tokens.push({ value: exp[0], type: TYPE_PUNCTURE });
      exp = exp.slice(1);
    } else if ((re = reUnit.exec(exp))) {
      tokens.push({ value: re[0], type: TYPE_UNIT });
      exp = exp.slice(re[0].length);
    } else if ((re = reNum.exec(exp))) {
      tokens.push({ value: re[0], type: TYPE_NUMBER });
      exp = exp.slice(re[0].length);
    } else if ((re = reOp.exec(exp))) {
      tokens.push({
        value: re[0] as Ops,
        type: TYPE_OPERATOR
      });
      exp = exp.slice(re[0].length);
    } else {
      throw createError(calc);
    }
  }
  return tokens;
}

const PRECEDENCE = {
  "*": 3,
  "/": 3,
  "+": 2,
  "-": 2
};

function lex(tokens: Token[], calc: string): Node {
  function buildBinaryExpNode(stack: (Node | OpToken)[]): BinaryNode {
    const right = stack.pop() as Node;
    const op = stack.pop() as OpToken;
    const left = stack.pop() as Node;

    if (
      !left ||
      !left.nodeType ||
      !op ||
      op.type !== TYPE_OPERATOR ||
      !right ||
      !right.nodeType
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

  const stack: (Node | OpToken)[] = [];

  while (tokens.length) {
    const token = tokens.shift() as Token;
    if (token.type === TYPE_PUNCTURE && token.value === "(") {
      let deep = 0;
      const closeIndex = array.findIndex(tokens, t => {
        if (t.type === TYPE_PUNCTURE && t.value === "(") {
          deep++;
        } else if (t.type === TYPE_PUNCTURE && t.value === ")") {
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
        const beforeOp = (stack[stack.length - 2] as OpToken).value;
        if (PRECEDENCE[token.value] <= PRECEDENCE[beforeOp]) {
          stack.push(buildBinaryExpNode(stack));
        }
      }
      stack.push(token);
    } else if (token.type === TYPE_UNIT) {
      const { value } = token;
      const num = parseFloat(value);
      const unit = /[a-z%]+/i.exec(value)?.[0] || "";
      stack.push({
        nodeType: NODE_TYPE_UNIT,
        value: num,
        unit
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
  return stack[0] as Node;
}

function parse(calcStr: string): Node {
  const tokens = tokenize(calcStr);
  return lex(tokens, calcStr);
}

function calcNode(node: Node, context: CalcContext): number {
  if (node.nodeType === NODE_TYPE_BINARY_EXPRESSION) {
    const left = calcNode(node.left, context);
    const right = calcNode(node.right, context);

    switch (node.op.value) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      default:
        throw new Error(`calc error. unknown operator: ${node.op.value}`);
    }
  } else if (node.nodeType === NODE_TYPE_UNIT) {
    switch (node.unit) {
      case "%":
        return (node.value * context.full) / 100;
      case "em":
        return node.value * context.em;
      case "px":
        return node.value;
      default:
        throw new Error(`calc error. unknown unit: ${node.unit}`);
    }
  } else if (node.nodeType === NODE_TYPE_NUMBER) {
    return node.value;
  }
  throw new Error("calc error.");
}

function toPxInternal(value: string, context: CalcContext): number {
  const ast = parse(value);
  return calcNode(ast, context);
}

type CalcContext = {
  full: number;
  em: number;
};

export function toPx(value: string | number, context: CalcContext): number {
  if (typeof value === "string") {
    return toPxInternal(value.trim(), context);
  }
  return value - 0;
}
