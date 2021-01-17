import SymbolTable from "../../SymbolTable";
import MathUtils from "../../math/MathUtils";

export enum OperandType {
    V,
    I,
    F,
    B,
    K,
    DT,
    ST,
    V0,
    I_ARR,
    Number,
    Nibble,
    Byte,
    Address,
    Label
}

class Operand {
    private constructor(readonly type: OperandType, readonly value: string | number) {}

    public is(other: OperandType): boolean {
        if (this.type === other) {
            return true;
        } else if (other === OperandType.V0 && this.type === OperandType.V && this.value === 0) {
            return true;
        } else if (this.type === OperandType.Number) {
            if (other === OperandType.Nibble) {
                return this.value <= 0xF;
            } else if (other === OperandType.Byte) {
                return this.value <= 0xFF;
            } else if (other === OperandType.Address) {
                return this.value <= 0xFFF;
            }
        }

        return false;
    }

    public static fromString(o: string): Operand | null {
        return Operand.parseV(o) || Operand.parseNum(o) || Operand.parseLiteral(o);
    }

    private static parseV(s: string): Operand | null {
        if (/^V[0-9A-F]$/i.test(s)) {
            return new Operand(OperandType.V, parseInt(s.slice(1), 16));
        } else {
            return null;
        }
    }

    private static parseNum(s: string): Operand | null {
        let num = toBase10(s);
        if (num !== null) {
            return new Operand(OperandType.Number, num);
        } else {
            return null;
        }
    }

    private static parseLiteral(s: string): Operand | null {
        if (/^[A-Z0-9_]+$/i.test(s)) {
            switch (s.toUpperCase()) {
                case 'I':
                    return new Operand(OperandType.I, 'I');
                case 'B':
                    return new Operand(OperandType.B, 'B');
                case 'K':
                    return new Operand(OperandType.K, 'K');
                case 'DT':
                    return new Operand(OperandType.DT, 'DT');
                case 'ST':
                    return new Operand(OperandType.ST, 'ST');
                case '[I]':
                    return new Operand(OperandType.I_ARR, '[I]');
                default:
                    return new Operand(OperandType.Label, s);
            }
        } else {
            return null;
        }
    }
}

class Instruction {

    readonly mnemonic: string;
    readonly operands: Operand[];
    readonly source: string;
    readonly lineNumber: number;

    constructor(mnemonic: string, operands: Operand[], source: string, actualLineNumber: number) {
        this.mnemonic = mnemonic;
        this.operands = operands;
        this.source = source;
        this.lineNumber = actualLineNumber;
    }

    public static fromString(line: string, lineNumber: number): Instruction | null {
        let opEnd = line.indexOf(' ');
        let mnemonic: string;
        let operands: Operand[] = [];
        if (opEnd !== -1) {
            mnemonic = line.slice(0, opEnd);
            let operandStrings = line.slice(opEnd).trim().split(/\s*,\s*/);
            for (let o of operandStrings) {
                let operand = Operand.fromString(o);
                if (operand !== null) {
                    operands.push(operand);
                } else {
                    return null;
                }
            }
        } else {
            mnemonic = line;
        }

        return new Instruction(mnemonic, operands, line, lineNumber);
    }
}

export default class Assembler {

    private readonly labels: SymbolTable<string> = new SymbolTable<string>(Assembler.KEYWORDS);

    private static readonly KEYWORDS = [
        'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6',
        'V7', 'V8', 'V9', 'VA', 'VB', 'VC', 'VD',
        'VF', 'ST', 'DT', 'I', '[I]', 'F', 'B', 'K',
        'CLS', 'RET', 'SYS', 'JP', 'CALL', 'SE', 'SNE',
        'LD', 'ADD', 'OR', 'AND', 'XOR', 'SUB', 'SHR',
        'SUBN', 'SHL', 'RND', 'DRW', 'SKP', 'SKNP',
    ];

    private static readonly INSTRUCTIONS: Record<string, [(OperandType)[], ((...v: any[]) => number)][]> = {
        'ADD': [
            [[OperandType.I, OperandType.V], (_i: string, vx: number) => 0xF01E | (vx << 8)],
            [[OperandType.V, OperandType.Byte], (vx: number, byte: number) => 0x7000 | (vx << 8) | (byte)],
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x8004 | (vx << 8) | (vy << 4)]],
        'AND': [
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x8002 | (vx << 8) | (vy << 4)]],
        'CALL': [
            [[OperandType.Address], (addr: number) => 0x2000 | addr]],
        'CLS': [
            [[], () => 0x00E0]],
        'DRW': [
            [[OperandType.V, OperandType.V, OperandType.Nibble], (vx: number, vy: number, n: number) => 0xD000 | (vx << 8) | (vy << 4) | n]],
        'JP': [
            [[OperandType.Address], (addr: number) => 0x1000 | addr],
            [[OperandType.V0, OperandType.Address], (_v0: string, addr: number) => 0xB000 | addr]],
        'LD': [
            [[OperandType.B, OperandType.V], (_b: any, v: number) => 0xF033 | (v << 8)],
            [[OperandType.DT, OperandType.V], (_dt: any, v: number) => 0xF015 | (v << 8)],
            [[OperandType.F, OperandType.V], (_f: any, v: number) => 0xF029 | (v << 8)],
            [[OperandType.I, OperandType.Address], (_i: any, addr: number) => 0xA000 | addr],
            [[OperandType.I_ARR, OperandType.V], (_ai: any, v: number) => 0xF055 | (v << 8)],
            [[OperandType.ST, OperandType.V], (_st: any, v: number) => 0xF018 | (v << 8)],
            [[OperandType.V, OperandType.Byte], (v: number, byte: number) => 0x6000 | (v << 8) | byte],
            [[OperandType.V, OperandType.DT], (v: number, _dt: any) => 0xF007 | (v << 8)],
            [[OperandType.V, OperandType.I_ARR], (v: number, _ai: any) => 0xF065 | (v << 8)],
            [[OperandType.V, OperandType.K], (v: number, _k: any) => 0xF00A | (v << 8)],
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x8000 | (vx << 8) | (vy << 4)]],
        'OR': [
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x8001 | (vx << 8) | (vy << 4)]],
        'RET': [
            [[], () => 0x00EE]],
        'RND': [
            [[OperandType.V, OperandType.Byte], (v: number, byte: number) => 0xC000 | (v << 8) | byte]],
        'SE': [
            [[OperandType.V, OperandType.Byte], (v: number, byte: number) => 0x3000 | (v << 8) | byte],
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x5000 | (vx << 8) | (vy << 4)]],
        'SHL': [
            [[OperandType.V], (v: number) => 0x800E | (v << 8)],
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x800E | (vx << 8) | (vy << 4)]],
        'SHR': [
            [[OperandType.V], (v: number) => 0x8006 | (v << 8)],
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x8006 | (vx << 8) | (vy << 4)]],
        'SKNP': [
            [[OperandType.V], (v: number) => 0xE0A1 | (v << 8)]],
        'SKP': [
            [[OperandType.V], (v: number) => 0xE09E | (v << 8)]],
        'SNE': [
            [[OperandType.V, OperandType.Byte], (v: number, byte: number) => 0x4000 | (v << 8) | byte],
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x9000 | (vx << 8) | (vy << 4)]],
        'SUB': [
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x8005 | (vx << 8) | (vy << 4)]],
        'SUBN': [
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x8007 | (vx << 8) | (vy << 4)]],
        'SYS': [
            [[OperandType.Address], (addr: number) => addr]],
        'XOR': [
            [[OperandType.V, OperandType.V], (vx: number, vy: number) => 0x8003 | (vx << 8) | (vy << 4)]],
    };

    instructionToOpcode(instruction: Instruction): number | null {

        let opcodeInstruction = toBase10(instruction.mnemonic);
        if (opcodeInstruction !== null && instruction.operands.length === 0) {
            return opcodeInstruction;
        }

        let formats = Assembler.INSTRUCTIONS[instruction.mnemonic];
        if (formats !== undefined) {
            for (let format of formats) {
                let expected = format[0];
                let actual = instruction.operands;
                let operation = format[1];
                if (expected.length === actual.length) {
                    let match = true;
                    for (let o = 0; o < actual.length; o++) {
                        if (actual[o].is(OperandType.Label)) {
                            let newOperand = this.resolveLabel(actual[o]);
                            if (newOperand !== null) {
                                actual[o] = newOperand;
                            } else {
                                return null;
                            }
                        }
                        if (!actual[o].is(expected[o])) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        return operation(...actual.map(a => a.value));
                    }
                }
            }
        }
        throw new Error('Line ' + instruction.lineNumber + ' - Unrecognized instruction: '  + instruction.source);
    }

    static assemble(...lines: string[]): number[] {
        let assembler = new Assembler();
        let instructions: Instruction[] = [];
        let programCounter = 0x200;

        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {

            // Basic preprocessing
            let line = lines[lineNumber].trim();
            line = Assembler.truncateWhitespace(line);
            line = Assembler.removeComment(line);
            line = assembler.extractLabels(line, programCounter);

            if (line !== '' && !assembler.processDefine(line)) {
                // Build instructions
                let instruction = Instruction.fromString(line, lineNumber);
                if (instruction !== null) {
                    instructions.push(instruction);
                    programCounter++;
                } else {
                    throw new Error('Error on line ' + lineNumber + ": " + lines[lineNumber]);
                }
            }
        }

        // Resolve any forward declarations
        let opcodes: number[] = [];
        for (let i of instructions) {
            let opcode = assembler.instructionToOpcode(i);
            if (opcode === null) {
                throw new Error('Line ' + i.lineNumber + ' - Assembly failed: ' + i.source);
            } else {
                opcodes.push(opcode);
            }
        }

        return opcodes;
    }

    private resolveLabel(operand: Operand): Operand | null {
        if (operand.type === OperandType.Label) {
            let labelValue = this.labels.retrieve(operand.value as string);
            if (labelValue !== null) {
                let newOperand = Operand.fromString(labelValue);
                if (newOperand !== null) {
                    return this.resolveLabel(operand);
                } else {
                    return null;
                }
            } else {
                throw new Error("Unresolved label: " + operand.value);
            }
        } else {
            return operand;
        }
    }

    private processDefine(line: string): boolean {
        let hasDefine = false;
        if (line.toUpperCase().startsWith('DEFINE')) {
            let parts = line.split(/\s+/);
            let key = parts[1];
            let value = parts.slice(2).join(' ');
            this.labels.store(key, value);
            hasDefine = true;
        }
        return hasDefine;
    }

    /**
     * Adds all labels to the symbol table and returns the remainder
     * of the line.
     */
    private extractLabels(line: string, programCounter: number): string {
        let parts = line.split(':').map(label => label.trim());
        let labels = parts.slice(0, parts.length - 1);
        let remainder = parts[parts.length - 1];
        for (let label of labels) {
            this.labels.store(label, programCounter.toString());
        }
        return remainder;
    }

    private static truncateWhitespace(line: string): string {
        return line.replaceAll(/\s+/g, ' ');
    }

    private static removeComment(line: string): string {
        return line.split(';')[0].trim();
    }
}

/**
 * Check if the value is a recognized number format.
 * If so, convert it to base 10 and return it as a string.
 * Otherwise, return the given value.
 */
function toBase10(value: string): number | null {
    let result: number | null = null;
    try {
        let evaluated = MathUtils.eval(value);
        result = evaluated !== null ? Math.trunc(evaluated) : null;
    } catch (e) {}
    return result;
}