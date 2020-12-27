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
    private ctx: CanvasRenderingContext2D | null = null;

    constructor(props: PixelDisplayProps) {
        super(props);
        this.canvasRef = React.createRef();
        this.pixelHeight = Math.floor(props.height / props.rowCount);
        this.pixelWidth = Math.floor(props.width / props.columnCount);
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

    setPixel(x: number, y: number, state: boolean): void {
        this.ctx!.fillStyle = state ? this.props.foregroundColor : this.props.backgroundColor;
        this.ctx?.fillRect(x * this.pixelWidth, y * this.pixelHeight, this.pixelWidth, this.pixelHeight);
    }

    setPixels(pixels: [number, number, boolean][]): void {
        for (let i = 0; i < pixels.length; i++) {
            let [x, y, state] = pixels[i];
            this.setPixel(x, y, state);
        }
    }

    clear() {
        this.ctx!.fillStyle = this.props.backgroundColor;
        this.ctx?.fillRect(0, 0, this.props.width, this.props.height);
    }
}

export default PixelDisplay;