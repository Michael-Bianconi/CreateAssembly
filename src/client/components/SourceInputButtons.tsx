import React, {RefObject} from "react";
import SourceReader from "../../emulators/SourceReader";
import styles from "../css/modules/SourceInputButtons.module.css";

type SourceInputButtonsProps = {
    availableSamples: string[];
    onAssemblyLoad: ((lines: string[]) => void);
    onBinaryLoad: ((binary: Uint8Array) => void);
    onSampleChoice: ((sampleName: string) => void);
}

class SourceInputButtons extends React.Component<SourceInputButtonsProps> {

    private readonly binaryRef: RefObject<HTMLInputElement>;
    private readonly assemblyRef: RefObject<HTMLInputElement>;

    constructor(props: SourceInputButtonsProps) {
        super(props);
        this.binaryRef = React.createRef();
        this.assemblyRef = React.createRef();
    }

    componentDidMount(): void {
        if (this.props.onAssemblyLoad !== null && this.assemblyRef.current !== null) {
            SourceReader.addReadLinesListener(this.assemblyRef.current, this.props.onAssemblyLoad);
        }
        if (this.props.onBinaryLoad !== null && this.binaryRef.current !== null) {
            SourceReader.addReadBinaryListener(this.binaryRef.current, this.props.onBinaryLoad);
        }
        // TODO Samples and text editor
    }

    render() {
        let click = (ref: RefObject<HTMLInputElement>) => {
            if (ref.current !== null) {
                ref.current.click();
            }
        };
        return (
            <div className={styles.container}>
                <input type='file' ref={this.binaryRef} hidden />
                <input type='file' ref={this.assemblyRef} hidden />
                <button className={styles.btn} onClick={() => click(this.binaryRef)}>
                    Upload Binary
                </button>
                <button className={styles.btn} onClick={() => click(this.assemblyRef)}>
                    Upload Assembly
                </button>
            </div>
        );
    }
}

export default SourceInputButtons;