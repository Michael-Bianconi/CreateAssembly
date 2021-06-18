import MathUtils from "./MathUtils";
import SymbolTable from "../symbols/SymbolTable";

describe('MathUtils.toNum()', () => {

    test('Decimal', () => {
        expect(MathUtils.toNum('10')).toBe(10);
    });

    test('Hexadecimal', () => {
        expect(MathUtils.toNum('0x10')).toBe(0x10);
    });

    test('Octal', () => {
        expect(MathUtils.toNum('0o10')).toBe(8);
    });

    test('Binary', () => {
        expect(MathUtils.toNum('0b10')).toBe(2);
        expect(MathUtils.toNum('0b110110')).toBe(54);
    });

    test('Floating', () => {
        expect(MathUtils.toNum('1.5')).toBe(1.5);
        expect(MathUtils.toNum('0x54.6')).toBeNull();
    });
});

describe('MathUtils.eval()', () => {

    test('Number formats', () => {
        expect(MathUtils.eval('10')).toBe(10);
        expect(MathUtils.eval('0x10')).toBe(16);
        expect(MathUtils.eval('0o10')).toBe(8);
        expect(MathUtils.eval('0b10')).toBe(2);
    });

    test('Arithmetic', () => {
        expect(MathUtils.eval('1 + 3')).toBe(4);
        expect(MathUtils.eval('4 / 5')).toBe(4 / 5);
    });

    test('Symbols', () => {
        let symbols = new SymbolTable();
        symbols.store('x', 5);
        symbols.store('y', 'x + 5');
        expect(MathUtils.eval('x', symbols)).toBe(5);
        expect(MathUtils.eval('y', symbols)).toBe(10);
        expect(MathUtils.eval('x + y', symbols)).toBe(15);
        expect(MathUtils.eval('y + y', symbols)).toBe(20);
        expect(MathUtils.eval('y + z', symbols)).toBeNull();
    });

    test('Circular Symbols', () => {
        let symbols = new SymbolTable();
        symbols.store('x', 'y');
        symbols.store('y', 'x');
        symbols.store('z', 'z');
        symbols.store('a', 'a + 5');
        symbols.store('b', 'a + 5');
        expect(MathUtils.eval('x', symbols)).toBeNull();
        expect(MathUtils.eval('y', symbols)).toBeNull();
        expect(MathUtils.eval('z', symbols)).toBeNull();
        expect(MathUtils.eval('a', symbols)).toBeNull();
        expect(MathUtils.eval('b', symbols)).toBeNull();
    });

    test('Unary', () => {
        expect(MathUtils.eval('-4')).toBe(-4);
        expect(MathUtils.eval('1-4')).toBe(-3);
        expect(MathUtils.eval('--4')).toBe(4);
        expect(MathUtils.eval('1--4')).toBe(5);
        expect(MathUtils.eval('~0b110110')).toBe(~54);
        expect(MathUtils.eval('!4')).toBe(0);
        expect(MathUtils.eval('!0')).toBe(1);
        expect(MathUtils.eval('5 ! 0')).toBeNull();
        expect(MathUtils.eval('5 - - - - - 3')).toBe(5 - - - - - 3);
    });

    test('Parentheses', () => {
        expect(MathUtils.eval('(5 + 4) * 9')).toBe(81);
        expect(MathUtils.eval('5 + (4 * 9)')).toBe(41);
        expect(MathUtils.eval('(5 + 4 * 9)')).toBe(41);
        expect(MathUtils.eval('(5 + 4) * (9 / 1)')).toBe(81);
        expect(MathUtils.eval('(5 + 4) * (9)')).toBe(81);
        expect(MathUtils.eval('((5 + (4)) * 9)')).toBe(81);
        expect(MathUtils.eval('(5 + 4 * 9')).toBeNull();
        expect(MathUtils.eval('5 + 4) * 9')).toBeNull();
    });

    test('Floating', () => {
        expect(MathUtils.eval('4 * 1.5')).toBe(6);
    });
});