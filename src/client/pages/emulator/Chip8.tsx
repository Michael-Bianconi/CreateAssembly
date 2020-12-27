import React, {RefObject} from "react";
import PixelDisplay from "../../components/PixelDisplay";
import styles from '../../css/modules/chip8/Chip8.module.css';
import SourceInputButtons from "../../components/SourceInputButtons";
import Emulator from "../../emulators/chip8/Emulator";
import Debugger from "../../components/chip8/Debugger";
import Assembler from "../../emulators/chip8/Assembler";
import Preprocessor from "../../emulators/chip8/Preprocessor";

class Chip8 extends React.Component<{}> {

    public static readonly URL = '/emulators/Emulator';
    private readonly emulator: Emulator;
    private readonly displayRef: RefObject<PixelDisplay>;
    private readonly debuggerRef: RefObject<Debugger>;

    constructor(props: {}) {
        super(props);
        this.emulator = new Emulator();
        this.displayRef = React.createRef<PixelDisplay>();
        this.debuggerRef = React.createRef<Debugger>();
    }

    componentDidMount(): void {
        if (this.debuggerRef.current !== null) {
            this.debuggerRef.current.display = this.displayRef.current;
        }
        console.log('Mounted debugger: ' + this.debuggerRef.current !== null);
        console.log('Mounted display: ' + this.displayRef.current !== null);
    }

    render() {
        return (
            <div>
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
                <SourceInputButtons
                    onBinaryLoad={null}
                    onAssemblyLoad={(lines: string[]) => {
                        let preprocessor = new Preprocessor();
                        let preprocessedLines = preprocessor.run(lines);
                        let binary = Assembler.assembleLines(preprocessedLines);
                        if (binary !== null) {
                            this.emulator.load(binary);
                        }
                    }} />
                <div className={styles.debuggerContainer}>
                    <Debugger ref={this.debuggerRef} emulator={this.emulator} />
                </div>
            </div>
        );
    }
}

export default Chip8;