class SourceReader {

    /**
     * Add a listener to the file input that will read the file
     * line by line and perform the callback.
     * @param fileInput Input (type='file') to add listener to.
     * @param onload Callback that expects a list of lines.
     */
    static addReadLinesListener(fileInput: HTMLInputElement, onload: ((lines: string[]) => void)) {
        fileInput.addEventListener('change', function(evt: Event) {

            // Casting to HTMLInputElement per TypeScript bug
            // https://github.com/microsoft/TypeScript/issues/31816
            let files = (evt.target as HTMLInputElement).files;
            let fr = new FileReader();

            fr.onload = function(e: ProgressEvent<FileReader>) {
                // Print the contents of the file
                let text = e.target?.result;
                if (typeof text === "string") {
                    onload(text.split(/[\r\n]+/g));
                }
            };

            if (files !== null) {
                fr.readAsText(files[0]);
            }
        });
    }

    /**
     * Add a listener to the file input that will read the file
     * byte by byte and perform the callback.
     * @param fileInput Input (type='file') to add listener to.
     * @param onload Callback that expects a Uint8Array.
     */
    static addReadBinaryListener(fileInput: HTMLInputElement, onload: ((binary: Uint8Array) => void)) {
        fileInput.addEventListener('change', function() {
            let reader = new FileReader();
            reader.onload = e => {
                onload(new Uint8Array(e.target?.result as ArrayBuffer));
            };
            if (this.files !== null) {
                reader.readAsArrayBuffer(this.files[0]);
            }
        }, false);
    }
}

export default SourceReader;