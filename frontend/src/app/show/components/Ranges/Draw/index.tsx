"use client";

import { ActiveRange, ColorCode, Range, Round } from "dc-ranges/types";
import React, { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import Layout, { getSizeAuto, getSize as getSizeLayout } from "./layout";
import { DrawHits } from "./hits";
import CountsCorner from "./CountsCorner";
import styles from "./rangeDraw.module.css";
import { useResizeObserver } from "@frontend/app/hooks/useResizeObserver";

interface DrawRangeProps {
    range: Range
    className?: string
}

const DrawRange = memo(
    function DrawRange({ range, className }: DrawRangeProps): React.JSX.Element {
        if (!range.active) return <></>
        return <DrawActiveRange range={range} className={className} />
    }, compareJSON);
export default DrawRange;


export function compareJSON(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

interface DrawActiveRangeProps {
    range: ActiveRange,
    className?: string
}

function useClientSize(ref: React.RefObject<Element | null>): [number, number] {
    const [size, setSize] = useState<[number, number]>([1, 1]);

    function updateSize() {
        if (!ref.current) return;
        if (ref.current.clientWidth === 0 || ref.current.clientHeight === 0) return;
        const newSize: [number, number] = [ref.current.clientWidth, ref.current.clientHeight];
        setSize(newSize);
    }

    useResizeObserver(ref, updateSize);

    useLayoutEffect(updateSize, [ref]);

    return size;
}

function DrawActiveRange({ range, className }: DrawActiveRangeProps): React.JSX.Element {
    const ref = useRef<SVGSVGElement>(null);

    const discipline = range.discipline;
    const round = discipline?.rounds[range.round] || null;

    const layoutSize = useMemo(() => {
        if (!round || !discipline) {
            return getSizeAuto(4.5, null, range.hits[range.round] || []) || [0, 0];
        }
        return getSizeLayout(round, discipline.gauge, range.hits[range.round] || []);
    }, [range]);

    const clientSize = useClientSize(ref);

    const size = useMemo(() => {
        const largestW = Math.max(layoutSize[0], layoutSize[1] / clientSize[1] * clientSize[0]);
        const sizes: [number, number] = [largestW, largestW / clientSize[0] * clientSize[1]];
        return sizes;
    }, [layoutSize, clientSize]);

    const strokeWidth = size[0] / clientSize[0];

    const viewBox = `${-size[0] / 2} ${-size[1] / 2} ${size[0]} ${size[1]}`;

    return (
        <svg ref={ref} className={`${className} ${styles.rangeDraw}`} viewBox={viewBox} strokeWidth={strokeWidth}>
            {round && discipline && <Background round={round} color={discipline.color} size={size} />}
            <DrawHits gauge={discipline?.gauge || 4.5} hits={range.hits[range.round] || []} round={round} strokeWidth={strokeWidth} />
        </svg>
    )
}

const Background = memo(function Background({ round, color, size }: { round: Round, color: ColorCode, size: [number, number] }): React.JSX.Element {
    return (
        <>
            {round.layout && <Layout layout={round.layout} color={color} />}
            {round.counts || <CountsCorner size={size} />}
        </>
    )
}, compareJSON);
