import React from "react";

type ModalProps = {};

type ModalState = {
    show: boolean;
};

class Modal extends React.Component<ModalProps, ModalState> {

    constructor(props: ModalProps) {
        super(props);
        this.state = {show: false};
    }

    show() {
        this.setState({show: true});
    }

    close() {
        this.setState({show: false});
    }

    render() {
        if (this.state.show) {
            return (
                <div>
                    <div>{this.props.children}</div>;
                    <div>
                        <button onClick={() => this.close()}>Close</button>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default Modal;