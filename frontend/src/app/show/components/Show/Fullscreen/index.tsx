"use client";

import { FaExpandArrowsAlt } from "react-icons/fa";
import styles from "./fullscreen.module.css";

export default function FullscreenButton({ container }: { container: HTMLDivElement | null }): React.JSX.Element {

    const toggleFullscreen = () => {
        if (!container) {
            return;
        }
        container.requestFullscreen();
    }

    return (
        <div className={styles.fullscreenContainer}>
            <div className={styles.fullscreenVertical}>
                <FaExpandArrowsAlt className={styles.fullscreen} onClick={toggleFullscreen} />
            </div>
        </div>
    );
}