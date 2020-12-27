import Assembler from "./Assembler";

class Preprocessor {

    private readonly labels: Record<string, string> = {};
    private programCounter: number = 0x200;

    run(raw: string[]): string[] {
        return this.secondPass(this.firstPass(raw));
    }

    /**
     * Build label table. Remove labels, defines, and comments.
     * Squash excessive whitespace. Make everything upper case.
     * Remove empty lines.
     */
    firstPass(raw: string[]): string[] {
        let result: string[] = [];
        for (let i = 0; i < raw.length; i++) {
            let line = raw[i].trim().toUpperCase();
            line = line.replace(/\s+/, ' ').replace('#', '0X');
            line = this.processLabel(Preprocessor.removeComment(line));
            if (line !== '') {
                if (!this.processDefine(line)) {
                    result.push(line);
                    this.programCounter += 2;
                }
            }
        }
        return result;
    }

    secondPass(firstPassed: string[]): string[] {
        return firstPassed.map(line => this.replaceLabels(line));
    }

    /**
     * @param line Assembly without comments (all uppercase).
     * @return Returns the rest of the line after the label, or
     *         the entire line if no label exists.
     * @throws String if a label is declared twice.
     */
    processLabel(line: string): string {
        let match = line.match(/^([A-Z_][0-9A-Z_]+)\s*:(.*)/);
        if (match !== null) {
            let [label, rest] = [match[1], match[2].trim()];
            if (this.labels[label] === undefined) {
                this.labels[label] = '0X' + this.programCounter.toString(16);
                return rest;
            } else {
                throw Object.assign(
                    new Error('Label redeclaration: ' + label),
                    { code: 402 }
                );
            }
        }
        return line;
    }

    /**
     * @param line Assembly without labels or comments (all uppercase).
     * @returns True if the line was a 'define' line, false otherwise.
     * @throws String if a label is declared twice.
     */
    processDefine(line: string): boolean {
        let match = line.match(/^DEFINE\s+([A-Z_][A-Z0-9_]*)\s+([A-Z0-9_]+)$/);
        if (match !== null) {
            let [key, value] = [match[1], match[2]];
            if (this.labels[key] === undefined) {
                this.labels[key] = value;
                return true;
            } else {
                throw Object.assign(
                    new Error('Label redeclaration: ' + key),
                    { code: 402 }
                );
            }
        } else {
            return false;
        }
    }

    replaceLabels(line: string): string {
        let [opcode, operands] = Assembler.splitMnemonic(line);
        for (let o = 0; o < operands.length; o++) {
            if (this.labels[operands[o]] !== undefined) {
                operands[o] = this.labels[operands[o]];
            }
        }
        return (opcode + ' ' + operands.join(',')).trim();
    }

    static removeComment(line: string): string {
        return line.split(';')[0].trim();
    }
}

export default Preprocessor;