import AbstractInterpreter from "../AbstractInterpreter";
import Emulator from "./Emulator";
import Disassembler from "./Disassembler";

class Interpreter extends AbstractInterpreter {

    public emulator: Emulator | undefined;

    constructor(emulator?: Emulator) {
        super();
        this.emulator = emulator;
    }

    _execute(command: string, operands: string[]): string[] {
        if (this.emulator) {
            switch (command.toUpperCase()) {
                case 'RUN':
                    if (this.emulator.running) {
                        return ['Application is already running'];
                    } else {
                        if (!this.emulator.start()) {
                            this.emulator.next();
                        }
                        this.emulator.start();
                        return ['Application is running'];
                    }
                case 'STOP':
                    this.emulator.pause();
                    return ['Application stopped'];
                case 'STEP':
                    this.emulator.next();
                    return [`Stepping into 0x${this.emulator.programCounter.toString(16)}`];
                case 'BREAKPOINTS':
                    if (operands.length === 0) {
                        return [this.emulator.breakpoints.join(' ')];
                    } else if (operands[0].toUpperCase() === 'ON') {
                        this.emulator.enableBreakpoints = true;
                        return ['Enabling breakpoints'];
                    } else if (operands[0].toUpperCase() === 'OFF') {
                        this.emulator.enableBreakpoints = false;
                        return ['Disabling breakpoints'];
                    } else {
                        return ['Expected value: [on|off]'];
                    }
                case 'BREAKPOINT':
                    if (operands.length > 0) {
                        return this.addBreakpoints(operands.map(parseInt));
                    } else {
                        return ['Expected value: <address>'];
                    }
                case 'STACK':
                    return [this.emulator.stack.join(' ')];
                case 'REGISTERS':
                    return this.formatRegisters();
                case 'SET':
                    if (operands.length === 2) {
                        return this.setRegister(operands[0], operands[1]);
                    } else {
                        return ['Expected value: <register> <value>'];
                    }
                case 'MEM':
                    if (operands.length === 2) {
                        let start = parseInt(operands[0]);
                        let end = parseInt(operands[1]);
                        if (!isNaN(start)
                            && start >= 0 && start < this.emulator.memory.length
                            && !isNaN(end)
                            && end >= start && end < this.emulator.memory.length) {
                            return this.getMem(start, end);
                        } else {
                            return ['Error: Invalid indices'];
                        }
                    } else {
                        return ['Error: Expected value: <start> <end>'];
                    }
                case 'DISASSEMBLE':
                    if (operands.length === 0) {
                        return this.disassemble(1);
                    } else {
                        let n = parseInt(operands[0]);
                        if (!isNaN(n)) {
                            return this.disassemble(n);
                        } else {
                            return ['Error: Invalid number <n>'];
                        }
                    }
                case 'HELP':
                    return this.showHelp();
                default:
                    return ['Unknown command'];
            }
        } else {
            return ['Error: emulator not attached'];
        }
    }

    private addBreakpoints(locations: number[]): string[] {
        let output = [];
        if (locations.includes(NaN)) {
            return ['Error: addresses must be numbers'];
        } else {
            for (let n of locations) {
                let index = this.emulator!.breakpoints.indexOf(n);
                if (index !== -1) {
                    this.emulator!.breakpoints.splice(index, 1);
                    output.push('Removing breakpoint at 0x' + n.toString(16));
                } else {
                    this.emulator!.breakpoints.push(n);
                    output.push('Adding breakpoint at 0x' + n.toString(16));
                }
            }
        }

        if (output.length === 0) {
            output.push('No active breakpoints');
        }
        return output;
    }

    // TODO Multiple registers per line
    private formatRegisters(): string[] {
        let registers = [];
        if (this.emulator) {
            let f = (n: number, len: number) => {
                return '0x' + n.toString(16).padStart(len, '0');
            };
            for (let v = 0; v < Emulator.V_REGISTER_COUNT; v++) {
                registers.push(`V${v.toString(16)}: ${f(this.emulator.vRegisters[v], 2)}`);
            }
            registers.push(`I : ${f(this.emulator.iRegister, 2)}`);
            registers.push(`DT: ${f(this.emulator.dtRegister, 2)}`);
            registers.push(`ST: ${f(this.emulator.stRegister, 2)}`);
            registers.push(`PC: ${f(this.emulator.programCounter, 3)}`);
            registers.push(`SP: ${f(this.emulator.stackPointer, 1)}`);
        }

        let lines: string[] = [];
        for (let i = 0; i < 7; i++) {
            lines.push(`${registers[i]}   ${registers[i+7]}   ${registers[i+14]}`);
        }

        return lines;
    }

    private setRegister(name: string, value: string): string[] {
        name = name.toUpperCase();
        let n = parseInt(value);
        if (!isNaN(n) && n >= 0) {
            if (name.startsWith('V')) {
                let vRegNum = parseInt(name.slice(1), 16);
                if (!isNaN(vRegNum)) {
                    if (vRegNum >= 0 && vRegNum <= 0xF) {
                        if (n <= 0xFF) {
                            this.emulator!.vRegisters[vRegNum] = n;
                            return [`Setting ${name} to ${value}`];
                        } else {
                            return ['Error: Value must be in range [0,0xFF]'];
                        }
                    } else {
                        return ['Error: invalid V register'];
                    }
                } else {
                    return ['Error: invalid V register'];
                }
            } else if (name === 'I') {
                if (n <= 0xFFFF) {
                    this.emulator!.iRegister = n;
                    return ['Setting I register to ' + value];
                } else {
                    return ['Error: Value must be in range [0, 0xFFFF]'];
                }
            } else if (name === 'DT') {
                if (n <= 0xFF) {
                    this.emulator!.dtRegister = n;
                    return ['Setting DT register to ' + value];
                } else {
                    return ['Error: Value must be in range [0, 0xFF]'];
                }
            } else if (name === 'ST') {
                if (n <= 0xFF) {
                    this.emulator!.stRegister = n;
                    return ['Setting ST register to ' + value];
                } else {
                    return ['Error: Value must be in range [0, 0xFF]'];
                }
            } else if (name === 'PC') {
                if (n <= 0xFFFF) {
                    this.emulator!.programCounter = n;
                    return ['Setting program counter to ' + value];
                } else {
                    return ['Error: Value must be in range [0, 0xFFFF]'];
                }
            } else if (name === 'SP') {
                if (n <= 0xF) {
                    this.emulator!.stackPointer = n;
                    return ['Setting stack pointer to ' + value];
                } else {
                    return ['Error: Value must be in range [0, 0xF]'];
                }
            } else {
                return ['Error: Unrecognized register'];
            }
        } else {
            return ['Error: Value must be a number >= 0'];
        }
    }

    private getMem(start: number, end: number): string[] {
        let lines = [];
        for (let i = start; i < end; i += 10) {
            lines.push(
                '0x' + i.toString(16).padStart(3, '0') + ': ' +
                Array.from(this.emulator!.memory.slice(i, i+5))
                .map(n => n.toString(16).padStart(2, '0')).join(' ') +
                '  ' + Array.from(this.emulator!.memory.slice(i+5, i+10))
                    .map(n => n.toString(16).padStart(2, '0')).join(' '));
        }
        return lines;
    }

    disassemble(numOps: number): string[] {
        let lines: string[] = [];
        for (let i = 0; i < numOps * 2; i += 2) {
            let op = this.emulator?.get_instruction(this.emulator?.programCounter + i);
            if (op !== null && op !== undefined) {
                let opStr = Disassembler.disassemble(op);
                lines.push(opStr !== null ? opStr : 'NULL');
            }
        }
        return lines;
    }

    showHelp(): string[] {
        return [
            'run                    Run the application',
            'pause                  Pause the application',
            'step                   Execute next operation',
            'breakpoints [on|off]   Toggle all breakpoints',
            'breakpoint [<addr>]    Add/remove breakpoint',
            'registers              Display all registers',
            'set <register> <value> Store value in register',
            'mem <start> <end>      Display memory data',
            'stack                  Display stack data',
            'disassemble [<n>]      Display next n opcodes',
            'help                   Show this message'
        ];
    }
}

export default Interpreter;