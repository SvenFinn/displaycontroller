"use client";

import { FaExpandArrowsAlt } from "react-icons/fa";
import styles from "./fullscreen.module.css";
import { RefObject } from "react";

export default function FullscreenButton({ container }: { container: RefObject<HTMLDivElement | null> }): React.JSX.Element {

    const toggleFullscreen = () => {
        if (!container.current) {
            return;
        }
        container.current.requestFullscreen();
    }

    return (
        <div className={styles.fullscreenContainer}>
            <div className={styles.fullscreenVertical}>
                <FaExpandArrowsAlt className={styles.fullscreen} onClick={toggleFullscreen} />
            </div>
        </div>
    );
}