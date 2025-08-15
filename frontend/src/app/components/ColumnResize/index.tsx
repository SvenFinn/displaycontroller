"use client";

import React, {
    Children,
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";
import styles from "./ColumnResize.module.css";

interface ColumnResizeProps extends React.HTMLAttributes<HTMLDivElement> {
    initialSizes?: number[];
}

const ColumnResize = forwardRef<HTMLDivElement, ColumnResizeProps>(
    ({ children, className = "", initialSizes, style, ...rest }, ref) => {
        const childrenArray = Children.toArray(children);

        // Initialize sizes
        initialSizes =
            initialSizes ||
            childrenArray.map(() => 100 / childrenArray.length);

        while (initialSizes.length < childrenArray.length) {
            initialSizes.push(100 / childrenArray.length);
        }
        initialSizes = constrainSizes(initialSizes);

        const [sizes, setSizes] = useState(initialSizes);
        const containerRef = useRef<HTMLDivElement>(null);

        // Forward the ref to the container div
        useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

        function onMouseDown(event: React.MouseEvent, index: number) {
            event.preventDefault();
            const startX = event.clientX;
            const startSize = sizes[index];

            function onMouseMove(event: MouseEvent) {
                const dx = event.clientX - startX;
                const container = containerRef.current;
                if (!container) return;

                const dxPercent = (dx / container.clientWidth) * 100;
                const newSize = startSize + dxPercent;
                const nextSize = sizes[index + 1] - dxPercent;

                if (newSize < 15 || newSize > 85) return;
                if (nextSize < 15 || nextSize > 85) return;

                const newSizes = [...sizes];
                newSizes[index] = newSize;
                newSizes[index + 1] = nextSize;
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
            <div
                {...rest}
                ref={containerRef}
                className={`${styles.container} ${className}`}
                style={style}
            >
                {childrenArray.map((child, index) => (
                    <div
                        key={index}
                        style={{ width: `${sizes[index]}%` }}
                        className={styles.column}
                    >
                        {child}
                        {index < childrenArray.length - 1 && (
                            <div
                                className={styles.resizeHandle}
                                onMouseDown={(event) => onMouseDown(event, index)}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    }
);

ColumnResize.displayName = "ColumnResize";

function constrainSizes(sizes: number[]) {
    const total = sizes.reduce((acc, size) => acc + size, 0);
    return sizes.map((size) => (size / total) * 100);
}

export default ColumnResize;
