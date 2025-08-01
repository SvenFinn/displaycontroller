import { LayoutGames, Range } from "dc-ranges-types";
import dart from "./dartboard.svg";

interface DartLayoutProps {
    layout: LayoutGames
}
export default function DartLayout({ layout }: DartLayoutProps): React.JSX.Element {
    if (!layout) return <></>;
    if (layout.mode !== "dart") return <></>;

    const size = layout.type === "pistol" ? 125 : 90;
    const corner = -size / 2;

    return <image href={dart.src} x={corner} y={corner} width={size} height={size} />
}

export function getSizeFixed(range: Range): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const round = range.discipline.rounds[range.round];
    if (!round) return [0, 0];
    const layout = range.discipline.layouts[round.layoutId];
    if (!layout) return [0, 0];
    if (layout.mode !== "dart") return [0, 0];
    switch (layout.type) {
        case "pistol":
            return [125, 125];
        case "rifle":
            return [90, 90];
        default:
            return [0, 0];
    }
}

export function getHitColor(ring: number, isLatest: boolean): string {
    return "#FFFF00";
}
