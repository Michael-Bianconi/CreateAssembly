import React from "react";
import TwoWayMap from "../../../symbols/TwoWayMap";
import styles from "../../css/modules/chip8/Keypad.module.css";
import BaseKeypad from "../../../input/BaseKeypad";

type KeypadState = {
    keypad: BaseKeypad;
}

export default class Keypad extends React.Component<{}, KeypadState> {

    private static readonly DEFAULT_KEYMAP = {
        '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
        'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
        'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
        'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF,
    };

    constructor(props: {}) {
        super(props);

        let localKeymap = {};
        Object.assign(localKeymap, Keypad.DEFAULT_KEYMAP);

        this.state = {
            keypad: new BaseKeypad(new TwoWayMap(localKeymap)),
        };
    }

    componentDidMount(): void {
        document.addEventListener('keydown', (event) => {
            this.state.keypad.keyDown(event.key.toLowerCase());
            this.forceUpdate();
        });

        document.addEventListener('keyup', (event) => {
            this.state.keypad.keyUp(event.key.toLowerCase());
            this.forceUpdate();
        });
    }

    render() {
        return (
            <div>
                <table>
                    <tbody>
                    <tr>
                        <td>{this.renderKey(0x1)}</td>
                        <td>{this.renderKey(0x2)}</td>
                        <td>{this.renderKey(0x3)}</td>
                        <td>{this.renderKey(0xC)}</td>
                    </tr>
                    <tr>
                        <td>{this.renderKey(0x4)}</td>
                        <td>{this.renderKey(0x5)}</td>
                        <td>{this.renderKey(0x6)}</td>
                        <td>{this.renderKey(0xD)}</td>
                    </tr>
                    <tr>
                        <td>{this.renderKey(0x7)}</td>
                        <td>{this.renderKey(0x8)}</td>
                        <td>{this.renderKey(0x9)}</td>
                        <td>{this.renderKey(0xE)}</td>
                    </tr>
                    <tr>
                        <td>{this.renderKey(0xA)}</td>
                        <td>{this.renderKey(0x0)}</td>
                        <td>{this.renderKey(0xB)}</td>
                        <td>{this.renderKey(0xF)}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    renderKey(value: number): JSX.Element {
        return (
            <div className={[styles.key, this.state.keypad.isPressed(value) ? styles.pressed : styles.unpressed].join(' ')}>
                <span className={styles.keyValue}>{value.toString(16).toUpperCase()}</span>
                <br />
                <span className={styles.keyPhysical}>{this.state.keypad.getKeyFromValue(value)}</span>
            </div>
        );
    }
}