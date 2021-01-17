import React, {RefObject} from "react";
import PixelDisplay from "../components/PixelDisplay";
import styles from '../css/modules/chip8/Chip8.module.css';
import SourceInputButtons from "../components/SourceInputButtons";
import Emulator from "../../emulators/chip8/Emulator";
import Assembler from "../../emulators/chip8/Assembler";
import Preprocessor from "../../emulators/chip8/Preprocessor";
import Terminal from "../components/Terminal";
import Interpreter from "../../emulators/chip8/Interpreter";

type Chip8State = {
    loaded: boolean;
    assemblyError: null | Error;
    showManual: boolean;
};

class Chip8 extends React.Component<{}, Chip8State> {

    public static readonly URL = '/chip8';

    private readonly displayRef: RefObject<PixelDisplay>;
    private readonly terminalRef: RefObject<Terminal>;
    private readonly interpreter: Interpreter;
    private readonly emulator: Emulator;


    constructor(props: {}) {
        super(props);
        this.state = {loaded: false, assemblyError: null, showManual: false};
        this.emulator = new Emulator();
        this.interpreter = new Interpreter(this.emulator);
        this.displayRef = React.createRef<PixelDisplay>();
        this.terminalRef = React.createRef<Terminal>();
    }

    private initEmulator() {

        if (!this.emulator.display && this.displayRef.current !== null) {
            this.emulator.display = this.displayRef.current;
        }

        this.emulator.onBreakpoint = () => {
            let message = `Breakpoint (0x${this.emulator.programCounter.toString(16)})`;
            this.terminalRef.current?.addHistoryLines([message], false);
        };
        this.emulator.onEndOfRAM = () => {
            let message = 'Reached end of available RAM, halting execution';
            this.terminalRef.current?.addHistoryLines([message], false);
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
                    <h1 className={styles.title}>Chip-8</h1>
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
                    <h1 className={styles.title}>Chip-8</h1>
                    <SourceInputButtons
                        availableSamples={['Tic Tac Toe', 'Places']}
                        onSampleChoice={() => {}}
                        onBinaryLoad={() => {}}
                        onAssemblyLoad={(lines: string[]) => {
                            try {
                                let preprocessedLines = Preprocessor.run(lines);
                                let binary = Assembler.assembleLines(preprocessedLines);
                                if (binary !== null) {
                                    this.emulator.load(binary);
                                    this.setState({loaded: true, assemblyError: null, showManual: false});
                                }
                            } catch (e) {
                                this.setState({loaded: false, assemblyError: e, showManual: false});
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
                        {this.state.showManual &&
                            <a href={process.env.PUBLIC_URL + '/chip8/styleguide.pdf'}>PDF</a>
                        }
                        {!this.state.showManual &&
                            <div>
                                Need some help?
                                <button onClick={() => this.setState({loaded: false, assemblyError: null, showManual: true})}>
                                    Click here
                                </button>
                            </div>
                        }
                    </div>
                </div>
            );
        }
    }
}

export default Chip8;