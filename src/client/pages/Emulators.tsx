import React from "react";
import styles from "../css/modules/Emulators.module.css"
import {Link} from "react-router-dom";
import Chip8 from "./emulator/Chip8";

class Emulators extends React.Component {

    public static readonly URL = '/emulators';

    render() {
        return (
            <ul className={styles.emulatorList}>
                <li>
                    <Link className={styles.emulatorListing} to={Chip8.URL}>Chip-8</Link>
                </li>
                <li>
                    <Link className={styles.emulatorListing404} to='/emulators/Pep8'>Pep-8</Link>
                </li>
                <li>
                    <Link className={styles.emulatorListing404} to='/emulators/MP944'>MP944</Link>
                </li>
            </ul>
        )
    }
}

export default Emulators;