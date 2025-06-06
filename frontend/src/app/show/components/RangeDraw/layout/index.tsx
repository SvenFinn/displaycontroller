import { DisciplineLayout } from "@shared/ranges/discipline/layout";
import Rings, { getSizeFixed as getFixedRings, getHitColor as getRingsHitColor } from "./rings";
import DartLayout, { getSizeFixed as getFixedDarts, getHitColor as getDartHitColor } from "./dart";
import { Range } from "@shared/ranges";

interface LayoutProps {
    layout: DisciplineLayout;
    color: string;
}

export default function Layout({ layout, color }: LayoutProps): React.JSX.Element {
    if (!layout) return <></>;
    switch (layout.mode) {
        case "rings":
            return <Rings layout={layout} color={color} />;
        case "dart":
            return <DartLayout layout={layout} />;
        default:
            return <></>;
    }
}

export function getSize(range: Range): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const round = range.discipline.rounds[range.round];
    const gauge = range.discipline.gauge;
    if (!round) return [0, 0];
    let diameters = [0, 0];
    switch (round.zoom.mode) {
        case "auto":
            diameters = getSizeAuto(range);
            break;
        case "fixed":
        case "none":
            diameters = getSizeFixed(range);
            break;
        default:
            return [0, 0];
    }
    return diameters.map((d) => d + gauge * 1.1) as [number, number];
}

function getSizeFixed(range: Range): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const round = range.discipline.rounds[range.round];
    if (!round) return [0, 0];
    const layout = range.discipline.layouts[round.layoutId];
    if (!layout) return [0, 0];
    switch (layout.mode) {
        case "rings":
            return getFixedRings(range);
        case "dart":
            return getFixedDarts(range);
        default:
            return [0, 0];
    }
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
        return getSizeFixed(range);
    }
    let startingIndex = 0;
    if (hits.length < round.maxHits) {
        startingIndex = Math.floor((hits.length - 1) / hitsPerView) * hitsPerView;

    }
    const hitsCopy = hits.slice(startingIndex)
    const sizes = [Math.max(...hitsCopy.map(hit => Math.abs(hit.x))),
    Math.max(...hitsCopy.map(hit => Math.abs(hit.y)))];
    return sizes.map((s) => s * 2) as [number, number];
}

export function getHitColor(layout: DisciplineLayout, ring: number, isLatest: boolean): string {
    switch (layout.mode) {
        case "rings":
            return getRingsHitColor(ring, isLatest);
        case "dart":
            return getDartHitColor(ring, isLatest);
        default:
            return "#000000";
    }
}

