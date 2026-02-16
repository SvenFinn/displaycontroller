import { ColorCode, Hit, Hits, Layout, Mode, Range, Round, UnsignedInteger, UnsignedNumber, ValidHit, Zoom } from "dc-ranges-types";
import { memo, useMemo } from "react";
import { layoutRings } from "./rings";
import { layoutDart } from "./dart";
import { layoutChess } from "./chess";
import { layoutStars } from "./stars";
import { layoutRectangle } from "./rectangle";


export interface LayoutInterface<T extends Layout> {
    render(props: { layout: T, color: ColorCode }): React.ReactNode;
    getHitColor(hit: ValidHit, isLatest: boolean): ColorCode;
    getSizeFixed(layout: T, value: UnsignedInteger): [number, number];
    getSizeNone(layout: T): [number, number];
}

export function getLayout(layout: Layout): LayoutInterface<any> | null {
    switch (layout.mode) {
        case "rings": return layoutRings;
        case "dart": return layoutDart;
        case "chess": return layoutChess;
        case "stars":
        case "easter":
        case "winter": return layoutStars;
        case "rectangle": return layoutRectangle;
        default: return null;
    }
}

interface LayoutProps {
    layout: Layout;
    color: string;
}

export default function LayoutComp({ layout, color }: LayoutProps): React.ReactNode {
    const layoutInterface = getLayout(layout);
    return layoutInterface?.render({ layout, color }) || <></>;
}


export function getSize(round: Round, gauge: UnsignedNumber, hits: Hits): [number, number] {
    return getSizeInternal(round, gauge, hits).map((d) => d + gauge * 1.1) as [number, number];
}

function getSizeInternal(round: Round, gauge: UnsignedNumber, hits: Hits): [number, number] {
    const layoutInterface = round.layout ? getLayout(round.layout) : null;
    if (!layoutInterface) {
        return [0, 0];
    }
    const zoom = round.zoom;
    const layout = round.layout;
    switch (zoom.mode) {
        case "auto":
            const size = getSizeAuto(gauge, round, hits);
            if (!size) {
                return layoutInterface.getSizeNone(layout);
            }
            return size;
        case "fixed":
            return layoutInterface.getSizeFixed(layout, zoom.value);
        case "none":
            return layoutInterface.getSizeNone(layout);
        default:
            return [0, 0];
    }
}


export function getSizeAuto(gauge: UnsignedNumber, round: Round | null, hits: Hits): [number, number] | null {
    let selectedHits = hits;
    const maxHitId = Math.max(...hits.map(h => h.id));

    if (round && maxHitId < round.maxHits) {
        const latestSeriesId =
            Math.floor((maxHitId - 1) / round.hitsPerView);

        selectedHits = hits.filter(
            hit =>
                Math.floor((hit.id - 1) / round.hitsPerView) ===
                latestSeriesId
        );
    }
    const validHits = selectedHits.filter((hit) => hit.valid) as Array<ValidHit>;
    if (validHits.length === 0 || round?.mode.mode == "fullHidden") {
        return null;
    }

    const sizes = [Math.max(...validHits.map(hit => Math.abs(hit.x))),
    Math.max(...validHits.map(hit => Math.abs(hit.y)))];
    return sizes.map((s) => s * 2 + gauge) as [number, number];
}

export function getHitColor(layout: Layout, hit: Hit, isLatest: boolean): ColorCode {
    const layoutInterface = getLayout(layout);
    if (!layoutInterface || !hit.valid) {
        return "#000000";
    }
    return layoutInterface.getHitColor(hit, isLatest);
}

