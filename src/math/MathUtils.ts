import SymbolTable from "../symbols/SymbolTable";

// Sorted in terms of precedence (not including unary plus and minus)
const OPERATORS = [
    "(", ")", "!", "~", "**", "*", "/", "%",
    "+", "-", "<<", ">>", "<", "<=", ">", ">=",
    "==", "!=", "&", "^", "|", "&&", "||"
];
const UNARY_OPERATORS = ["+", "-", "~", "!"];
const OPERATOR_DELIMITER = new RegExp("(" + OPERATORS.map(escapeRegExp).join('|') + ")");
const OPERATIONS: Record<string, ((l: number, r: number) => number)> = {
    "**": (l: number, r: number): number => Math.pow(l, r),
    "*": (l: number, r: number): number => l * r,
    "/": (l: number, r: number): number => l / r,
    "%": (l: number, r: number): number => l % r,
    "+": (l: number, r: number): number => l + r,
    "-": (l: number, r: number): number => l - r,
    "<<": (l: number, r: number): number => l << r,
    ">>": (l: number, r: number): number => l >> r,
    "<": (l: number, r: number): number => l < r ? 1 : 0,
    "<=": (l: number, r: number): number => l <= r ? 1 : 0,
    ">": (l: number, r: number): number => l > r ? 1 : 0,
    ">=": (l: number, r: number): number => l >= r ? 1 : 0,
    "==": (l: number, r: number): number => l === r ? 1 : 0,
    "!=": (l: number, r: number): number => l !== r ? 1 : 0,
    "&": (l: number, r: number): number => l & r,
    "^": (l: number, r: number): number => l ^ r,
    "|": (l: number, r: number): number => l | r,
    "&&": (l: number, r: number): number => l && r,
    "||": (l: number, r: number): number => l || r,
};

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default class MathUtils {

    public static eval(expr: string, symbols?: SymbolTable<string | number>): number | null {
        return this.parse(expr, symbols);
    }

    private static parse(expr: string | number | null, symbols?: SymbolTable<string | number>): number | null {
        if (expr === null) {
            return null;
        } else if (typeof expr === 'number') {
            return expr;
        }
        let noSpace = expr.replaceAll(/\s+/g, '');
        let parts: (string | number)[] = noSpace.split(OPERATOR_DELIMITER).filter(p => p !== '');
        return this.parseDelimited(parts, symbols);
    }

    private static parseDelimited(expr: (string | number)[], symbols?: SymbolTable<string | number>): number | null {

        // Recursively replace all symbols in the array with their values
        if (symbols !== undefined && !this.resolveSymbols(expr, symbols)) {
            return null;
        }

        // Resolve all constants from strings to numbers
        // This will also ensure there are no unresolved symbols
        if (!this.resolveConstants(expr)) {
            return null;
        }

        if (!this.resolveParens(expr)) {
            return null;
        }

        if (!this.resolveAllUnary(expr)) {
            return null;
        }

        if (!this.resolveAllBinary(expr)) {
            return null;
        }

        if (expr.length !== 1 || typeof expr[0] !== 'number') {
            return null;
        }

        return expr[0];
    }

    /**
     * Convert all string numbers to number numbers.
     * Will return false if there are any unresolved symbols.
     *
     * Prerequisites:
     *  - No symbols
     */
    private static resolveConstants(parts: (string | number)[]): boolean {
        for (let i = 0; i < parts.length; i++) {
            if (typeof parts[i] === 'string') {
                if (!OPERATORS.includes(parts[i] as string)) {
                    let value = this.toNum(parts[i] as string);
                    if (value !== null) {
                        parts[i] = value;
                    } else {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Finds all unary operators and resolves them.
     * Removes the operators from the expression.
     *
     * Prerequisites:
     * - No symbols
     * - No parenthesis
     */
    private static resolveAllUnary(expr: (string | number)[]): boolean {
        for (let i = 0; i < expr.length; i++) {
            if (typeof expr[i] === 'string' && UNARY_OPERATORS.includes(expr[i] as string)) {
                let previous = expr[i-1];
                if (typeof previous !== 'number') {
                    let operand = this.findNextConstant(expr, i);
                    if (operand !== -1) {
                        let value = this.resolveUnary(expr.slice(i, operand + 1));
                        if (value !== null) {
                            expr.splice(i, operand - i + 1, value);
                        } else {
                            return false; // Could not resolve unary
                        }
                    } else {
                        return false; // No operand
                    }
                }
            }
        }
        return true;
    }

    /**
     * Resolves the current unary expression.
     *
     * Prerequisites:
     *  - Starts with N unary operators
     *  - Ends with a number
     *  - Contains no other elements
     */
    private static resolveUnary(expr: (string | number)[]): number | null {
        let operand = expr[expr.length - 1];
        if (typeof operand !== 'number') {
            return null;
        }
        for (let i = expr.length - 2; i >= 0; i--) {
            if (typeof expr[i] === 'string' && UNARY_OPERATORS.includes(expr[i] as string)) {
                let operation = expr[i] as string;
                switch (operation) {
                    case '+': break;
                    case '-': operand = -operand; break;
                    case '!': operand = operand === 0 ? 1 : 0; break;
                    case '~': operand = ~operand; break;
                    default: return null;
                }
            }
        }
        return operand;
    }

    /**
     * Resolves all remaining binary operations.
     * Replaces them with the resulting value.
     *
     * Prerequisites:
     *  - No symbols
     *  - No parentheses
     *  - No unary operations
     */
    private static resolveAllBinary(expr: (string | number)[]): boolean {
        let operatorPosition = -1;
        let precedence = 0;
        while (operatorPosition === -1 && precedence < OPERATORS.length) {
            operatorPosition = expr.indexOf(OPERATORS[precedence]);
            precedence++;
        }
        if (operatorPosition !== -1) {
            let operator = expr[operatorPosition] as string;
            let left = expr[operatorPosition - 1];
            let right = expr[operatorPosition + 1];
            if (typeof left === 'number' && typeof right === 'number') {
                let operation = OPERATIONS[operator];
                if (operation !== undefined) {
                    let value = operation(left, right);
                    expr.splice(operatorPosition - 1, 3, value);
                    return this.resolveAllBinary(expr);
                } else {
                    return false; // Non binary operator
                }
            } else {
                return false;  // Operands are operators or undefined
            }
        } else {
            return true;
        }
    }

    /**
     * Finds all parentheses and resolves them.
     * Removes the parentheses and contents and replaces them
     * with their parsed value.
     *
     * Prerequisites:
     *  - No symbols
     */
    private static resolveParens(expr: (string | number)[]): boolean {
        // Group and resolve parentheses
        let openParen = expr.indexOf('(');
        while (openParen !== -1) {
            let closeParen = this.findMatchingParen(expr, openParen);
            if (closeParen !== -1) {
                let inner = this.parseDelimited(expr.slice(openParen + 1, closeParen));
                if (inner !== null) {
                    expr.splice(openParen, closeParen - openParen + 1, inner);
                } else {
                    return false;
                }
            } else {
                return false; // Missing closing paren
            }
            openParen = expr.indexOf('(');
        }
        return true;
    }

    /**
     * Finds all symbols and resolves them.
     * Removes the symbol and replaces it with its value.
     *
     * Prerequisites:
     *  - None
     */
    private static resolveSymbols(parts: (string | number)[], symbols: SymbolTable<string | number>): boolean {
        try {
            for (let i = 0; i < parts.length; i++) {
                if (typeof parts[i] === 'string') {
                    if (symbols.has(parts[i] as string)) {
                        let value = this.parse(symbols.retrieve(parts[i] as string), symbols);
                        if (value !== null) {
                            parts[i] = value;
                        } else {
                            return false;
                        }
                    }
                }
            }
        } catch (RangeError) {  // Most likely caused by circular dependency
            return false;
        }
        return true;
    }

    private static findMatchingParen(parts: (string | number | null)[], openIndex: number): number {
        let parenCount = 0;
        for (let i = openIndex; i < parts.length; i++) {
            if (parts[i] === '(') {
                parenCount++;
            } else if (parts[i] === ')') {
                parenCount--;
                if (parenCount === 0) {
                    return i;
                }
            }
        }
        return -1;
    }

    private static findNextConstant(parts: (string | number)[], start: number): number {
        for (let i = start; i < parts.length; i++) {
            if (typeof parts[i] === 'number') {
                return i;
            }
        }
        return -1;
    }

    static toNum(s: string): number | null {
        if (/^[0-9]+(\.[0-9]*)?$/i.test(s)) {
            return parseFloat(s);
        } else if (/^0x[a-f0-9]+$/i.test(s)) {
            return parseInt(s, 16);
        } else if (/^0b[0-1]+$/i.test(s)) {
            return parseInt(s.slice(2), 2);
        } else if (/^0o[0-7]+$/i.test(s)) {
            return parseInt(s.slice(2), 8);
        } else {
            return null;
        }
    }

}