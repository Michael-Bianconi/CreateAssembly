import Assembler from "./Assembler";
import {LabelNameError, LabelRedeclarationError} from "./Errors";

class Preprocessor {

    private static readonly KEYWORDS = [
        'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6',
        'V7', 'V8', 'V9', 'VA', 'VB', 'VC', 'VD',
        'VF', 'ST', 'DT', 'I', '[I]', 'F', 'B', 'K',
    ];

    public readonly labels: Record<string, string> = {};
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
            line = Preprocessor.removeComment(line);
            let extractedLabelsObj = Preprocessor.extractLabels(line);
            line = extractedLabelsObj.line;
            for (let label of extractedLabelsObj.labels) {
                this.addLabel(label);
            }

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
            if (Preprocessor.KEYWORDS.includes(label)) {
                throw new LabelNameError(label);
            } else if (this.labels[label] === undefined) {
                this.labels[label] = '0X' + this.programCounter.toString(16);
                return rest;
            } else {
                throw new LabelRedeclarationError(label);
            }
        }
        return line;
    }

    private addLabel(key: string, value?: string): void {
        value = value === undefined ? '0X' + this.programCounter.toString(16) : value;
        if (Preprocessor.KEYWORDS.includes(key)) {
            throw new LabelNameError(key);
        } else if (this.labels[key] === undefined) {
            this.labels[key] = value;
        } else {
            throw new LabelRedeclarationError(key);
        }
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
            if (Preprocessor.KEYWORDS.includes(key)) {
                throw new LabelNameError(key);
            } else if (this.labels[key] === undefined) {
                this.labels[key] = value;
                return true;
            } else {
                throw new LabelRedeclarationError(key);
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

    /**
     * @return Returns a list of labels and the remainder of the line.
     */
    static extractLabels(line: string): {labels: string[], line: string} {
        let l = line.split(':').map(label => label.trim().toUpperCase());
        for (let label of l.slice(0, l.length-1)) {
            if (!label.match(/^[A-Z_][0-9A-Z_]*$/) || Preprocessor.KEYWORDS.includes(label)) {
                throw new LabelNameError(label);
            }
        }
        return {labels: l.slice(0, l.length-1), line: l[l.length-1].trim()};
    }
}

export default Preprocessor;