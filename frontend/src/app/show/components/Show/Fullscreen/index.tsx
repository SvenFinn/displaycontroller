"use client";

import { FaExpandArrowsAlt } from "react-icons/fa";
import styles from "./fullscreen.module.css";

export default function FullscreenButton(): React.JSX.Element {

    const toggleFullscreen = () => {
        document.documentElement.requestFullscreen();
    }

    return (
        <div className={styles.fullscreenContainer}>
            <div className={styles.fullscreenVertical}>
                <FaExpandArrowsAlt className={styles.fullscreen} onClick={toggleFullscreen} />
            </div>
        </div>
    );
}