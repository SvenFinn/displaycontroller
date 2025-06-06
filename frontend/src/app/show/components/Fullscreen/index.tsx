"use client";

import { FaExpandArrowsAlt } from "react-icons/fa";
import styles from "./fullscreen.module.css";
import icon from "./fullscreen.png";

export default function FullscreenButton(): React.JSX.Element {

    const toggleFullscreen = () => {
        document.documentElement.requestFullscreen();
    }

    return (
        <FaExpandArrowsAlt className={styles.fullscreen} onClick={toggleFullscreen} />
    );
}