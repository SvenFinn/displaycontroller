
"use client";

import { Children, useState, useRef } from "react";
import styles from "./ColumnResize.module.css";

interface ColumnResizeProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    initialSizes?: number[];
}

export default function ColumnResize({ children, className, initialSizes, style }: ColumnResizeProps) {
    const childrenArray = Children.toArray(children);
    initialSizes = initialSizes || childrenArray.map(() => 100 / childrenArray.length);
    while (initialSizes.length < childrenArray.length) {
        initialSizes.push(100 / childrenArray.length);
    }
    initialSizes = constrainSizes(initialSizes);

    const [sizes, setSizes] = useState(initialSizes);
    const containerRef = useRef<HTMLDivElement>(null);

    function onMouseDown(event: React.MouseEvent, index: number) {
        event.preventDefault();
        const startX = event.clientX;
        const startSize = sizes[index];

        function onMouseMove(event: MouseEvent) {
            const dx = event.clientX - startX;

            const container = containerRef.current;
            if (!container) {
                return;
            }

            const dx_percent = dx / container.clientWidth * 100;
            const new_size = startSize + dx_percent;
            const next_size = sizes[index + 1] - dx_percent;
            if (new_size < 15 || new_size > 85) {
                return;
            }
            if (next_size < 15 || next_size > 85) {
                return;
            }

            const newSizes = [...sizes];
            newSizes[index] = new_size;
            newSizes[index + 1] = next_size;
            setSizes(constrainSizes(newSizes));
        }

        function onMouseUp() {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        }

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    return (
        <div className={`${styles.container} ${className}`} style={{ ...style }} ref={containerRef}>
            {childrenArray.map((child, index) => (

                <div key={index} style={{ width: `${sizes[index]}%` }} className={styles.column}>
                    {child}
                    {index < childrenArray.length - 1 && (
                        <div
                            className={styles.resizeHandle}
                            onMouseDown={(event) => onMouseDown(event, index)}
                        />
                    )}
                </div>
            ))}
        </div >
    );

}

function constrainSizes(sizes: number[]) {
    const total = sizes.reduce((acc, size) => acc + size, 0);
    // Ensure the total size is 100
    const mappedSizes = sizes.map(size => size / total * 100);
    return mappedSizes;
}
