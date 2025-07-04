import starsRifle from "./starsLg.svg";
import starsPistol from "./starsLp.svg";

import { Range } from "@shared/ranges";
import { LayoutGamesCommon } from "@shared/ranges/discipline/layout/games";

interface StarsLayoutProps {
    layout: LayoutGamesCommon
}
export default function StarsLayout({ layout }: StarsLayoutProps): React.JSX.Element {
    if (!layout) return <></>;
    if (layout.mode !== "stars") return <></>;
    switch (layout.type) {
        case "pistol":
            return <image href={starsPistol.src} x={-176 / 2} y={-176 / 2} width={176} height={176} />
        case "rifle":
            return <image href={starsRifle.src} x={-176 / 2} y={-176 / 2} width={176} height={176} />
        default:
            return <></>;
    }
}

export function getSizeFixed(range: Range): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const round = range.discipline.rounds[range.round];
    if (!round) return [0, 0];
    const layout = range.discipline.layouts[round.layoutId];
    if (!layout) return [0, 0];
    if (layout.mode !== "stars") return [0, 0];
    return [176, 176];
}

export function getHitColor(ring: number, isLatest: boolean): string {
    return "#0000FF";
}
