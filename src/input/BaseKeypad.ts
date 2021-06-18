import TwoWayMap from "../symbols/TwoWayMap";

type KeypadEventListener = (physicalKey: string) => void;

export default class BaseKeypad {

    private readonly keymap: TwoWayMap;
    private readonly keysPressed = new Set<number>();
    private _onKeydown: KeypadEventListener = () => {};
    private _onKeyup: KeypadEventListener = () => {};

    constructor(keymap: TwoWayMap) {
        this.keymap = keymap;
        this.onKeydown = () => {};
        this.onKeyup = () => {};
    }

    set onKeydown(eventListener: KeypadEventListener) {
        this._onKeydown = (physicalKey: string) => {
            this.keyDown(physicalKey);
            eventListener(physicalKey);
        }
    }

    set onKeyup(eventListener: KeypadEventListener) {
        this._onKeyup = (physicalKey: string) => {
            this.keyUp(physicalKey);
            eventListener(physicalKey);
        }
    }

    keyDown(physicalKey: string) {
        let value = this.keymap.getValue(physicalKey);
        if (value !== undefined) {
            this.keysPressed.add(value as number);
        }
    }

    keyUp(physicalKey: string) {
        let value = this.keymap.getValue(physicalKey);
        if (value !== undefined) {
            this.keysPressed.delete(value as number);
        }
    }

    isPressed(keyValue: number) {
        return this.keysPressed.has(keyValue);
    }

    getNextPressed(): number | null {
        return this.keysPressed.values().next().value || null;
    }

    getKeyFromValue(value: number): string | null {
        return this.keymap.getKey(value) as string;
    }
}