import React from "react";
import styles from "../css/modules/Header.module.css";
import Dropdown from "./Dropdown";
import {Link} from "react-router-dom";

const EMULATORS = [
    {href: '4004', text: '4004'},
    {href: 'cadc', text: 'CADC'},
    {href: 'chip8', text: 'Chip-8'},
    {href: 'pep8', text: 'Pep-8'},
    {href: 'mp944', text: 'MP944'},
];

class Header extends React.Component<{title?: string}> {

    render() {
        return (
            <div className={styles.navbar}>
                <Link to="/" className={styles.navbarTitle}>CreateAssembly.app</Link>
                <div className={styles.dropdownContainer}>
                    <Dropdown text='Emulators' options={EMULATORS} />
                </div>
                <Link to='/source' className={styles.navbarLink}>Source</Link>
                <Link to='/about' className={styles.navbarLink}>About</Link>
                { this.props.title !== undefined &&
                    <div className={styles.pageTitleContainer}>
                        <span className={styles.pageTitle}>{this.props.title}</span>
                    </div>
                }
            </div>
        );
    }
}

export default Header