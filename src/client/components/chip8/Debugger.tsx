import Emulator from "../../emulators/chip8/Emulator";
import PixelDisplay from "../PixelDisplay";
import React from "react";
import styles from "../../css/modules/chip8/Debugger.module.css"
import Disassembler from "../../emulators/chip8/Disassembler";

type DebuggerProps = {
    emulator: Emulator;
}

type DebuggerState = {
    hasStarted: boolean;
    isPaused: boolean;
}

function RegisterField(props: {label: string, value: number}) {
    return (
        <span className={styles.registerField}>
            <label>{props.label}</label>
            <input value={'0x' + props.value.toString(16)} readOnly />
        </span>
    )
}

class Debugger extends React.Component<DebuggerProps, DebuggerState> {

    private readonly breakpoints: number[] = [];
    public display: PixelDisplay | null = null;

    constructor(props: DebuggerProps) {
        super(props);
        this.state = {
            hasStarted: false,
            isPaused: false
        };
    }

    private start() {
        this.setState({hasStarted: true, isPaused: false});
        this.next();
    }

    private step() {
        this.props.emulator.next();
        this.display?.setPixels(this.props.emulator.unflushedPixels);
        this.props.emulator.unflushedPixels.length = 0;
        if (this.state.isPaused) {
            this.forceUpdate();
        }
    }

    private next() {
        if (this.state !== undefined &&
            this.state.hasStarted &&
            !this.state.isPaused &&
            !this.breakpoints.includes(this.props.emulator.programCounter)) {
            this.step();
        }
        setTimeout(() => this.next(), 10);
    }

    private pause() {
        this.setState({hasStarted: true, isPaused: true});
    }

    private stop() {
        this.setState({hasStarted: false, isPaused: false});
    }

    openBreakpointModal() {

    }

    addBreakpoint(pc: number): void {
        this.breakpoints.push(pc);
    }

    render() {
        let disableStart = this.state.hasStarted && !this.state.isPaused;
        let disablePause = !this.state.hasStarted || this.state.isPaused;
        let disableStop = !this.state.hasStarted;
        let disableStep = !this.state.hasStarted || !this.state.isPaused;
        let disableBreakpoints = this.state.hasStarted && !this.state.isPaused;
        return (
            <div className={styles.mainContainer}>
                <div className={styles.actionButtonContainer}>
                    <button onClick={() => this.start()} disabled={disableStart}>Start</button>
                    |
                    <button onClick={() => this.pause()} disabled={disablePause}>Pause</button>
                    |
                    <button onClick={() => this.stop()} disabled={disableStop}>Stop</button>
                    |
                    <button onClick={() => this.step()} disabled={disableStep}>Step</button>
                    |
                    <button onClick={() => this.openBreakpointModal()} disabled={disableBreakpoints}>Breakpoints</button>
                </div>
                <hr />
                {!this.state.hasStarted &&
                    <div>Application not started</div>
                } {this.state.hasStarted && !this.state.isPaused &&
                    <div>Application is running</div>
                } {this.state.hasStarted && this.state.isPaused &&
                    <div>
                        <table className={styles.registerTable}>
                        <tbody>
                        <tr>
                        <td><RegisterField label='V0' value={this.props.emulator.vRegisters[0]}/></td>
                        <td><RegisterField label='V7' value={this.props.emulator.vRegisters[7]}/></td>
                        <td><RegisterField label='VE' value={this.props.emulator.vRegisters[0xE]}/></td>
                        </tr>
                        <tr>
                        <td><RegisterField label='V1' value={this.props.emulator.vRegisters[1]}/></td>
                        <td><RegisterField label='V8' value={this.props.emulator.vRegisters[8]}/></td>
                        <td><RegisterField label='VF' value={this.props.emulator.vRegisters[0xF]}/></td>
                        </tr>
                        <tr>
                        <td><RegisterField label='V2' value={this.props.emulator.vRegisters[2]}/></td>
                        <td><RegisterField label='V9' value={this.props.emulator.vRegisters[9]}/></td>
                        <td><RegisterField label='I ' value={this.props.emulator.iRegister}/></td>
                        </tr>
                        <tr>
                        <td><RegisterField label='V3' value={this.props.emulator.vRegisters[3]}/></td>
                        <td><RegisterField label='VA' value={this.props.emulator.vRegisters[0xA]}/></td>
                        <td><RegisterField label='DT' value={this.props.emulator.dtRegister}/></td>
                        </tr>
                        <tr>
                        <td><RegisterField label='V4' value={this.props.emulator.vRegisters[4]}/></td>
                        <td><RegisterField label='VB' value={this.props.emulator.vRegisters[0xB]}/></td>
                        <td><RegisterField label='ST' value={this.props.emulator.stRegister}/></td>
                        </tr>
                        <tr>
                        <td><RegisterField label='V5' value={this.props.emulator.vRegisters[5]}/></td>
                        <td><RegisterField label='VC' value={this.props.emulator.vRegisters[0xC]}/></td>
                        <td><RegisterField label='PC' value={this.props.emulator.programCounter}/></td>
                        </tr>
                        <tr>
                        <td><RegisterField label='V6' value={this.props.emulator.vRegisters[6]}/></td>
                        <td><RegisterField label='VD' value={this.props.emulator.vRegisters[0xD]}/></td>
                        <td><RegisterField label='SP' value={this.props.emulator.stackPointer}/></td>
                        </tr>
                        </tbody>
                        </table>
                        <hr />
                        <div className={styles.actionButtonContainer}>
                            <button disabled>{Disassembler.disassemble(this.props.emulator.get_instruction())}</button>
                            |
                            <button>Stack</button>
                            |
                            <button>Memory</button>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default Debugger;