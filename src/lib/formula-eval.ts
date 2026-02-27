/**
 * Safe math expression evaluator for budget formulas.
 * No eval() or Function() — uses a hand-written tokenizer + recursive descent parser.
 *
 * Supported: +, -, *, /, ^ (power), parentheses, numeric literals, variable names.
 */

type Token =
  | { type: "number"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i++];
      }
      tokens.push({ type: "number", value: parseFloat(num) });
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let ident = "";
      while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
        ident += expr[i++];
      }
      tokens.push({ type: "ident", value: ident.toLowerCase() });
      continue;
    }

    if ("+-*/^".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: '${ch}' at position ${i}`);
  }
  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos = 0;
  private vars: Record<string, number>;

  constructor(tokens: Token[], vars: Record<string, number>) {
    this.tokens = tokens;
    this.vars = vars;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  private peekIsOp(...ops: string[]): boolean {
    const t = this.peek();
    return t?.type === "op" && ops.includes((t as { type: "op"; value: string }).value);
  }

  private peekOpValue(): string {
    return (this.peek() as { type: "op"; value: string }).value;
  }

  // expression = term (('+' | '-') term)*
  parseExpression(): number {
    let left = this.parseTerm();
    while (this.peekIsOp("+", "-")) {
      const op = this.peekOpValue();
      this.consume();
      const right = this.parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  // term = power (('*' | '/') power)*
  private parseTerm(): number {
    let left = this.parsePower();
    while (this.peekIsOp("*", "/")) {
      const op = this.peekOpValue();
      this.consume();
      const right = this.parsePower();
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  // power = unary ('^' power)?  (right-associative)
  private parsePower(): number {
    const base = this.parseUnary();
    if (this.peekIsOp("^")) {
      this.consume();
      const exp = this.parsePower();
      return Math.pow(base, exp);
    }
    return base;
  }

  // unary = '-' unary | primary
  private parseUnary(): number {
    if (this.peekIsOp("-")) {
      this.consume();
      return -this.parseUnary();
    }
    return this.parsePrimary();
  }

  // primary = number | ident | '(' expression ')'
  private parsePrimary(): number {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression");

    if (token.type === "number") {
      this.consume();
      return token.value;
    }

    if (token.type === "ident") {
      this.consume();
      const val = this.vars[token.value];
      if (val === undefined) throw new Error(`Unknown variable: '${token.value}'`);
      return val;
    }

    if (token.type === "lparen") {
      this.consume();
      const result = this.parseExpression();
      const closing = this.consume();
      if (!closing || closing.type !== "rparen") {
        throw new Error("Expected closing parenthesis");
      }
      return result;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }
}

export function evaluateFormula(
  expression: string,
  vars: Record<string, number>,
): number {
  const tokens = tokenize(expression);
  if (tokens.length === 0) return 0;
  const parser = new Parser(tokens, vars);
  const result = parser.parseExpression();
  if (!isFinite(result)) return 0;
  return result;
}

/** Validate that an expression can be parsed without errors. Returns null if valid, or an error message. */
export function validateExpression(expression: string): string | null {
  try {
    const dummyVars = { weight: 1, min: 1, max: 1, avg: 1, range: 1, value: 1 };
    evaluateFormula(expression, dummyVars);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Invalid expression";
  }
}
