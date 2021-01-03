class LabelRedeclarationError extends Error {
    constructor(label: string) {
        super(`Label declared twice: ${label}`); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

class LabelNameError extends Error {
    constructor(label: string) {
        super(`Invalid label: ${label}`); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

class LineError extends Error {
    constructor(line: string, lineNum: number) {
        super(`Error on line ${lineNum}: ${line}`); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

export {
    LabelRedeclarationError,
    LabelNameError,
    LineError
}