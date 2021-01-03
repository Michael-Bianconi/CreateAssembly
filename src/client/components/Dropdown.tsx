import React, {createRef, RefObject} from "react";
import styles from "../css/modules/Dropdown.module.css";
import {Link} from "react-router-dom";

type DropdownProps = {
    text: string,
    options: {href: string, text: string}[];
};

class Dropdown extends React.Component<DropdownProps, {isOpen: boolean}> {

    private readonly buttonRef: RefObject<HTMLButtonElement>;

    constructor(props: DropdownProps) {
        super(props);
        this.state = {isOpen: false};
        this.buttonRef = createRef<HTMLButtonElement>();
    }

    componentDidMount(): void {
        // If not clicking on the dropdown, close the dropdown
        document.addEventListener("click", (event: MouseEvent) => {
            if (this.state.isOpen && !this.buttonRef.current?.contains(event.target as Node)) {
                this.close();
            }
        }, false);
    }

    private open() {
        this.setState({isOpen: true});
    }

    private close() {
        this.setState({isOpen: false});
    }

    render() {
        return (
            <div className={styles.dropdown}>
                <button onClick={() => this.open()} ref={this.buttonRef} className={styles.dropbtn}>{this.props.text}</button>
                {this.state.isOpen &&
                    <div onClick={() => window.location.reload()} className={styles.dropdownContent}>
                        {this.Options()}
                    </div>
                }
            </div>
        );
    }

    private Options() {
        let jsx = [];
        for (let o of this.props.options) {
            jsx.push(<Link to={o.href} key={o.href}>{o.text}</Link>);
        }
        return jsx;
    }
}

export default Dropdown;