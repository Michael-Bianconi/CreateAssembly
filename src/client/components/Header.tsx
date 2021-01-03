import React from "react";
import styles from "../css/modules/Header.module.css";
import Dropdown from "./Dropdown";
import {Link} from "react-router-dom";

const EMULATORS = [
    {href: 'chip8', text: 'Chip-8'},
    {href: 'pep8', text: 'Pep-8'},
    {href: 'mp944', text: 'MP944'},
];

class Header extends React.Component {
    render() {
        return (
            <div className={styles.navbar}>
                <Link to="/" className={styles.navbarTitle}>CreateAssembly.app</Link>
                <Dropdown text='Emulators' options={EMULATORS} />
                <Link to='/source' className={styles.navbarLink}>Source</Link>
                <Link to='/about' className={styles.navbarLink}>About</Link>
            </div>
        );
    }
}

export default Header