"use client";

import styles from "./scaleText.module.css";
import { useState, useRef, useEffect } from "react";

interface ScaleTextProps {
    text: string;
}

export default function ScaleText({ text, }: ScaleTextProps): React.JSX.Element {
    const [fontSize, setFontSize] = useState<number>(100);
    const measureRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!measureRef.current || !containerRef.current) return;

        applyFontSize();

        const observer = new ResizeObserver(() => {
            applyFontSize();
        });

        function applyFontSize() {
            if (!measureRef.current) return;
            if (!containerRef.current) return;
            setFontSize(Math.min(100, Math.floor(100 * (containerRef.current.clientWidth * 0.95) / measureRef.current.clientWidth)));
        }
        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
        }
    }, [text]);

    return (
        <div ref={containerRef} className={styles.scaleText}>
            <span ref={measureRef} className={styles.measure}>{text}</span>
            <span className={styles.scaleText} style={{ fontSize: `${fontSize}%` }}>{text}</span>
        </div>
    )

}