import { DisciplineLayoutChess, DisciplineLayoutCustomCommon } from "@shared/ranges/discipline/layout";
import { Range } from "@shared/ranges";

import chessFive from "./5x5.svg";
import chessSix from "./6x6.svg";
import chessSeven from "./7x7.svg";
import chessTen from "./10x10.svg";
import { getSize } from "..";

interface ChessLayoutProps {
    layout: DisciplineLayoutChess
}
export default function ChessLayout({ layout }: ChessLayoutProps): React.JSX.Element {
    if (!layout) return <></>;

    const size = getSizeLayout(layout)[0];
    const corner = -size / 2;

    switch (layout.size) {
        case 5:
            return <image href={chessFive.src} x={corner} y={corner} width={size} height={size} />
        case 6:
            return <image href={chessSix.src} x={corner} y={corner} width={size} height={size} />
        case 7:
            return <image href={chessSeven.src} x={corner} y={corner} width={size} height={size} />
        case 10:
            return <image href={chessTen.src} x={corner} y={corner} width={size} height={size} />
        default:
            return <></>;
    }
}

function getSizeLayout(layout: DisciplineLayoutChess): [number, number] {
    if (layout.type === "rifle") {
        switch (layout.size) {
            case 5:
                return [85.5, 85.5];
            case 6:
                return [90, 90];
            case 7:
                return [90, 90];
            case 10:
                return [85.5, 85.5];
            default:
                return [0, 0];
        }
    } else if (layout.type === "pistol") {
        switch (layout.size) {
            case 5:
                return [120.5, 120.5];
            case 6:
                return [125, 125];
            case 7:
                return [125, 125];
            case 10:
                return [120.5, 120.5];
            default:
                return [0, 0];
        }
    }
    return [0, 0];
}


export function getSizeFixed(range: Range): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const round = range.discipline.rounds[range.round];
    if (!round) return [0, 0];
    const layout = range.discipline.layouts[round.layoutId];
    if (!layout) return [0, 0];
    if (layout.mode !== "chess") return [0, 0];
    return getSizeLayout(layout);
}

export function getHitColor(ring: number, isLatest: boolean): string {
    return "#0000FF";
}
