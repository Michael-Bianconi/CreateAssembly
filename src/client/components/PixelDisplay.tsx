import React, {RefObject} from "react";

type PixelDisplayProps = {
    width: number;
    height: number;
    rowCount: number;
    columnCount: number;
    foregroundColor: string;
    backgroundColor: string;
}

/**
 * Displays binary pixels (ON or OFF values only). Does not
 * keep track of current pixels internally. For best performance,
 * only call setPixels() with changed pixels.
 *
 * TODO Use a proxy and have this update automatically when the underlying data changes
 */
class PixelDisplay extends React.Component<PixelDisplayProps> {

    private readonly canvasRef: RefObject<HTMLCanvasElement>;
    private readonly pixelHeight: number;
    private readonly pixelWidth: number;
    private readonly data: boolean[][];
    private ctx: CanvasRenderingContext2D | null = null;

    constructor(props: PixelDisplayProps) {
        super(props);
        this.canvasRef = React.createRef();
        this.pixelHeight = Math.floor(props.height / props.rowCount);
        this.pixelWidth = Math.floor(props.width / props.columnCount);
        this.data = Array(this.props.rowCount);
        for (let row = 0; row < this.data.length; row++) {
            this.data[row] = Array(this.props.columnCount).fill(false);
        }
    }

    render() {
        return (
            <canvas ref={this.canvasRef} height={this.props.height} width={this.props.width}>
                Pixel display is not supported in your browser.
            </canvas>
        );
    }

    componentDidMount(): void {
        if (this.canvasRef.current !== null) {
            this.ctx = this.canvasRef.current.getContext('2d') as CanvasRenderingContext2D;
            this.clear();
        } else {
            console.log('Failed to get PixelDisplay context');
        }
    }

    /**
     * XOR the pixel onto the display.
     * @param x X coordinate
     * @param y Y coordinate
     * @param state Turn the pixel on or off
     * @returns True if there is a collision, false otherwise.
     */
    xorPixel(x: number, y: number, state: boolean): boolean {
        if (this.data[y][x] !== state) {
            this.data[y][x] = state;
            this.ctx!.fillStyle = state ? this.props.foregroundColor : this.props.backgroundColor;
            this.ctx?.fillRect(x * this.pixelWidth, y * this.pixelHeight, this.pixelWidth, this.pixelHeight);
            return false;
        } else {
            return state;
        }
    }

    clear() {
        for (let row of this.data) {
            for (let i = 0; i < row.length; i++) {
                row[i] = false;
            }
        }
        this.ctx!.fillStyle = this.props.backgroundColor;
        this.ctx?.fillRect(0, 0, this.props.width, this.props.height);
    }
}

export default PixelDisplay;