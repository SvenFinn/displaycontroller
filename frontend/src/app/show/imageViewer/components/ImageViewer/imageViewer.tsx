"use client";

import { ViewerScreen } from "@shared/screens/imageViewer";
import styles from "./imageViewer.module.css"
import { useEffect, useState } from "react";

interface ImageViewerProps {
    options: ViewerScreen["options"],
    onReady: () => void;
}

export default function ImageViewer({ options, onReady }: ImageViewerProps) {
    const [host, setHost] = useState<string>("");

    useEffect(() => {
        setHost(window.location.host.split(":")[0]);
    }, []);

    if (host === "") {
        return <></>;
    }

    const imageUrl = `http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/images/${options.file}`;
    return (
        <div className={styles.imageViewer}>
            <img src={imageUrl} alt="image" onLoad={onReady} className={styles.imageViewer} />
        </div>
    )
}

