"use client";

import { Range } from "@shared/ranges";
import { useEffect, useRef, useState } from "react";
import Layout, { getSize as getSizeLayout } from "./layout";
import Hits from "./hits";
import CountsCorner from "./CountsCorner";
import styles from "./rangeDraw.module.css";

interface DrawRangeProps {
    range: Range
    className?: string
}

export default function DrawRange({ range, className }: DrawRangeProps): React.JSX.Element {
    const ref = useRef<SVGSVGElement>(null);
    const [size, setSize] = useState<[number, number]>([0, 0]);
    const [strokeWidth, setStrokeWidth] = useState<number>(0);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(handleResize);
        observer.observe(ref.current);
        function handleResize() {
            if (!ref.current) return;
            const newSize = getSize(range, ref.current);
            if (newSize !== size) {
                setSize(newSize);
                const strokeWidth = newSize[0] / ref.current.clientWidth;
                setStrokeWidth(isNaN(strokeWidth) ? 0 : strokeWidth);
            }
        }
        return () => observer.disconnect();
    }, [range]);

    if (!range.active) return <></>
    if (!range.discipline) return <></>
    const round = range.discipline.rounds[range.round];
    if (!round) return <></>

    const layout = range.discipline.layouts[round.layoutId];
    if (!layout) return <></>

    const viewBox = `${-size[0] / 2} ${-size[1] / 2} ${size[0]} ${size[1]}`;

    return (
        <svg ref={ref} className={`${className} ${styles.rangeDraw}`} viewBox={viewBox} strokeWidth={strokeWidth}>
            <Layout layout={layout} color={range.discipline.color} />
            <CountsCorner counts={round.counts} size={size} />
            <Hits range={range} strokeWidth={strokeWidth} />
        </svg>
    )
}

function getSize(range: Range, ref: SVGSVGElement): [number, number] {
    if (ref.clientHeight === 0 || ref.clientWidth === 0) return [0, 0];
    if (!range.active) return [0, 0];
    const diameters = getSizeLayout(range);
    const largestW = Math.max(diameters[0], diameters[1] / ref.clientHeight * ref.clientWidth);
    const sizes = [largestW, largestW / ref.clientWidth * ref.clientHeight];
    return sizes as [number, number];
}