import React, {RefObject} from "react";
import PixelDisplay from "../components/PixelDisplay";
import styles from '../css/modules/chip8/Chip8.module.css';
import SourceInputButtons from "../components/SourceInputButtons";
import Emulator from "../emulators/chip8/Emulator";
import Assembler from "../emulators/chip8/Assembler";
import Preprocessor from "../emulators/chip8/Preprocessor";
import Terminal from "../components/Terminal";
import Interpreter from "../emulators/chip8/Interpreter";

class Chip8 extends React.Component<{}, {loaded: boolean, assemblyError: null | Error}> {

    public static readonly URL = '/chip8';

    private readonly displayRef: RefObject<PixelDisplay>;
    private readonly terminalRef: RefObject<Terminal>;
    private readonly interpreter: Interpreter;
    private readonly emulator: Emulator;


    constructor(props: {}) {
        super(props);
        this.state = {loaded: false, assemblyError: null};
        this.emulator = new Emulator();
        this.interpreter = new Interpreter(this.emulator);
        this.displayRef = React.createRef<PixelDisplay>();
        this.terminalRef = React.createRef<Terminal>();
    }

    private initEmulator() {

        if (!this.emulator.display && this.displayRef.current !== null) {
            this.emulator.display = this.displayRef.current;
        }

        if (this.terminalRef.current !== null) {
            this.emulator.onBreakpoint = () => {
                this.terminalRef.current?.addHistoryLines(['Breakpoint'], false);
            }
        }
    }

    componentDidMount(): void {
        this.initEmulator();
    }

    componentDidUpdate(): void {
        this.initEmulator();
    }

    render() {
        if (this.state.loaded) {
            return (
                <div>
                    <h1>Chip-8</h1>
                    <div className={styles.pixelDisplayContainer}>
                        <PixelDisplay
                            ref={this.displayRef}
                            width={640}
                            height={320}
                            rowCount={32}
                            columnCount={64}
                            foregroundColor={'white'}
                            backgroundColor={'black'} />
                    </div>
                    <div className={styles.debuggerContainer}>
                        <Terminal ref={this.terminalRef} interpreter={this.interpreter}/>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <h1>Chip-8</h1>
                    <SourceInputButtons
                        availableSamples={['Tic Tac Toe', 'Places']}
                        onSampleChoice={() => {}}
                        onBinaryLoad={() => {}}
                        onAssemblyLoad={(lines: string[]) => {
                            try {
                                let preprocessedLines = new Preprocessor().run(lines);
                                let binary = Assembler.assembleLines(preprocessedLines);
                                if (binary !== null) {
                                    this.emulator.load(binary);
                                    this.setState({loaded: true, assemblyError: null});
                                }
                            } catch (e) {
                                this.setState({loaded: false, assemblyError: e});
                            }
                        }} />
                    {this.state.assemblyError !== null &&
                        <div className={styles.errorContainer}>
                            Encountered an error during assembly:
                            <div className={styles.errorMessage}>
                                {this.state.assemblyError.message}
                            </div>
                        </div>
                    }
                    <div>
                        Need some help?
                    </div>
                </div>
            );
        }
    }
}

export default Chip8;