"use client";

import { useResizeObserver } from "@frontend/app/hooks/useResizeObserver";
import styles from "./scaleText.module.css";
import { useRef } from "react";

interface ScaleTextProps {
    text: string;
}

export function ScaleText({ text, }: ScaleTextProps): React.JSX.Element {
    const measureRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    useResizeObserver(containerRef, () => {
        if (!measureRef.current || !containerRef.current || !textRef.current) return;
        const scale = Math.min(100, Math.floor(100 * (containerRef.current.clientWidth) / measureRef.current.clientWidth));
        textRef.current.style.transform = `scale(${scale}%)`;
    });

    return (
        <div ref={containerRef} className={styles.scaleText}>
            <span ref={measureRef} className={styles.measure}>{text}</span>
            <span ref={textRef} className={styles.text}>{text}</span>
        </div>
    )
}