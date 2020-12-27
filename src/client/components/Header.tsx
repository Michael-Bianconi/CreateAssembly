import React from "react";
import {Link} from "react-router-dom";
import styles from "../css/modules/Header.module.css";
import Emulators from "../pages/Emulators";

function TitleLink(props: {to: string, label: string}) {
    return (
        <Link to={props.to} className={styles.headerTitleLink}>
            {props.label}
        </Link>
    );
}

function HeaderLink(props: {to: string, label: string}) {
    return (
        <Link to={props.to} className={styles.headerLink}>
            {props.label}
        </Link>
    );
}

class Header extends React.Component {
    render() {
        return (
            <header className={styles.header}>
                <nav className={styles.headerNav}>
                    <li>
                        <TitleLink to='/' label='CA' />
                    </li>
                    <li>
                        <HeaderLink to={Emulators.URL} label='Emulators' />
                    </li>
                        |
                    <li>
                        <HeaderLink to='/source' label='Source' />
                    </li>
                        |
                    <li>
                        <HeaderLink to='/about' label='About' />
                    </li>
                </nav>
            </header>
        )
    }
}

export default Header