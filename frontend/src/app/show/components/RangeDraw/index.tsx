"use client";

import { Range } from "@shared/ranges";
import { useEffect, useRef, useState } from "react";
import Rings from "./rings";
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
                const strokeWidth = Math.round(newSize[0] / ref.current.clientWidth);
                setStrokeWidth(isNaN(strokeWidth) ? 0 : strokeWidth);
            }
        }
        return () => observer.disconnect();
    }, [range, size]);

    if (!range.active) return <></>
    if (!range.discipline) return <></>
    const round = range.discipline.rounds[range.round];
    if (!round) return <></>

    const layout = range.discipline.layouts[round.layoutId];
    if (!layout) return <></>

    const viewBox = `${-size[0] / 2} ${-size[1] / 2} ${size[0]} ${size[1]}`;

    return (
        <svg ref={ref} className={`${className} ${styles.rangeDraw}`} viewBox={viewBox} strokeWidth={strokeWidth}>
            <Rings layout={layout} color={range.discipline.color} />
            <CountsCorner counts={round.counts} size={size} />
            <Hits range={range} strokeWidth={strokeWidth} />
        </svg>
    )
}

function getSize(range: Range, ref: SVGSVGElement): [number, number] {
    if (ref.clientHeight === 0 || ref.clientWidth === 0) return [0, 0];
    if (!range.active) return [0, 0];
    return getSizeInt(range, ref).map(size => Math.round(size * 100)) as [number, number];
}


function getSizeInt(range: Range, ref: SVGSVGElement): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const round = range.discipline.rounds[range.round];
    if (!round) return [0, 0];
    let diameters: [number, number] = [0, 0]
    switch (round.zoom.mode) {
        case "auto":
            diameters = getSizeAuto(range);
            break;
        case "fixed":
            diameters = getSizeFixed(range, round.zoom.value);
            break;
        case "none":
            const layout = range.discipline.layouts[range.round];
            if (!layout) return [0, 0];
            diameters = getSizeFixed(range, layout[0].value);
            break;
        default:
            return [0, 0];
    }
    const largestW = Math.max(diameters[0], diameters[1] / ref.clientHeight * ref.clientWidth);
    return [largestW, largestW / ref.clientWidth * ref.clientHeight];
}

function getSizeAuto(range: Range): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const gauge = range.discipline.gauge;
    const round = range.discipline.rounds[range.round];
    if (!round) return [0, 0];
    const hitsPerView = round.hitsPerView;
    if (!range.hits) return [0, 0];
    const hits = range.hits[range.round];
    if (!hits || hits.length == 0 || round.mode.mode === "fullHidden") {
        const layout = range.discipline.layouts[round.layoutId];
        if (!layout) return [0, 0];
        const diameter = layout[layout.length - 1].diameter + gauge * 1.1;
        if (diameter === 0) return [0, 0];
        return [diameter, diameter];

    }
    let startingIndex = 0;
    if (hits.length < round.maxHits) {
        startingIndex = Math.floor((hits.length - 1) / hitsPerView) * hitsPerView;

    }
    const hitsCopy = hits.slice(startingIndex)
    const sizes = [Math.max(...hitsCopy.map(hit => Math.abs(hit.x) + gauge * 1.1)),
    Math.max(...hitsCopy.map(hit => Math.abs(hit.y) + gauge * 1.1))];
    return sizes.map((s) => s * 2) as [number, number];
}

function getSizeFixed(range: Range, value: number): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const gauge = range.discipline.gauge;
    const round = range.discipline.rounds[range.round];
    if (!round) return [0, 0];
    const zoom = round.zoom;
    const layout = range.discipline.layouts[round.layoutId];
    if (!layout) return [0, 0];
    const ring = layout.find(ring => ring.value === value);
    if (!ring) return [0, 0];
    const diameter = ring.diameter + gauge * 1.1;
    return [diameter, diameter];
}