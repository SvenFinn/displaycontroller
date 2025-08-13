"use client";

import { ViewerScreen } from "dc-screens-types";
import styles from "./imageViewer.module.css"
import { useHost } from "@frontend/app/hooks/useHost";

interface ImageViewerProps {
    options: ViewerScreen["options"],
    onReady: () => void;
}

export default function ImageViewer({ options, onReady }: ImageViewerProps) {
    const host = useHost();

    if (!host) {
        return <></>
    }

    const imageUrl = `${host}/api/images/${options.path}`;
    return (
        <div className={styles.imageViewer}>
            <img src={imageUrl} alt="image" onLoad={onReady} className={styles.imageViewer} />
        </div>
    )
}

