export default class SymbolTable<T> {

    private static readonly keyFormat: RegExp = /^[A-Za-z_][A-Za-z0-9_]*$/;

    private readonly keywords: string[];
    private readonly symbols: Record<string, T> = {};

    constructor(keywords?: string[]) {
        this.keywords = keywords !== undefined ? keywords : [];
    }

    public has(key: string): boolean {
        return this.symbols[key] !== undefined;
    }

    public retrieve(key: string): T | null {
        if (this.has(key)) {
            return this.symbols[key];
        } else {
            return null;
        }
    }

    public store(key: string, value: T, allowReplace: boolean = false): void {
        if (SymbolTable.keyFormat.test(key)) {
            if (!this.keywords.includes(key.toUpperCase())) {
                if (allowReplace || !this.has(key)) {
                    this.symbols[key] = value;
                } else {
                    throw new Error('Duplicate symbol: ' + key);
                }
            } else {
                throw new Error('Cannot use a keyword as a label: ' + key);
            }
        } else {
            throw new Error('Invalid label: ' + key);
        }
    }
}