/**
 * Hooks into various debuggers and processes the terminal input
 * and returns the desired output. Extend this parser for each
 * emulator.
 */
abstract class AbstractInterpreter {

    /**
     * Given a command, parse and execute it.
     * @param command Command to execute.
     * @returns Output to print to the terminal.
     */
    public execute(command: string): string[] {
        let tokens = command.split(/\s+/);
        return this._execute(tokens[0], tokens.slice(1));
    }

    abstract _execute(command: string, operands: string[]): string[];
    abstract showHelp(): string[];
}

export default AbstractInterpreter;