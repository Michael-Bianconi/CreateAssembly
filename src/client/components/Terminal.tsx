import AbstractInterpreter from "../../emulators/AbstractInterpreter";
import React, {createRef, RefObject} from "react";
import styles from "../css/modules/Terminal.module.css"

type TerminalProps = {
    interpreter: AbstractInterpreter;
}

type TerminalState = {
    output: JSX.Element[];
}

class Terminal extends React.Component<TerminalProps, TerminalState> {

    private readonly inputFieldRef: RefObject<HTMLInputElement>;
    private readonly outputRef: RefObject<HTMLDivElement>;

    constructor(props: {interpreter: AbstractInterpreter}) {
        super(props);
        this.inputFieldRef = createRef<HTMLInputElement>();
        this.outputRef = createRef<HTMLDivElement>();
        this.state = {output: []};
        this.addHistoryLines(['Chip-8 Interpreter', 'Type "help" for available commands'], false);
    }

    scrollToHistoryBottom() {
        this.outputRef.current!.scrollTop = this.outputRef.current!.scrollHeight;
    }

    componentDidMount(): void {
        this.inputFieldRef.current!.onkeydown = (e) => {
            if (e.key === 'Enter') {
                let value = (e.target as HTMLInputElement).value;
                this.addHistoryLines(['$ ' + value], true);
                this.addHistoryLines(this.props.interpreter.execute(value), false);
                if (this.inputFieldRef.current !== null) {
                    this.inputFieldRef.current.value = '';
                }
            }
        };
        this.scrollToHistoryBottom();
    }

    componentDidUpdate() {
         this.scrollToHistoryBottom();
    }

    render() {
        return (
            <div className={styles.terminal}>
                <div ref={this.outputRef} className={styles.terminalHistory}>
                    {this.state.output}
                </div>
                <input
                    placeholder='Type "help" for available commands'
                    className={styles.terminalInput}
                    ref={this.inputFieldRef} />
            </div>
        )
    }

    addHistoryLines(lines: string[], isInput: boolean): void {
        let current = this.state.output;
        let classNames = [styles.terminalHistoryLine, isInput ? styles.terminalHistoryLineInput : styles.terminalHistoryLineOutput];

        for (let line of lines) {
            current.push(
                <span key={current.length} className={classNames.join(' ')}>
                    {line}
                </span>
            )
        }

        this.setState({output: current});
    }
}

export default Terminal;