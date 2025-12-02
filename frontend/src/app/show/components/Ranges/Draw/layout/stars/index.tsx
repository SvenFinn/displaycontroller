import starsRifle from "./starsLg.svg";
import starsPistol from "./starsLp.svg";
import easter from "./easter.svg";
import winter from "./winter.svg";

import { Range, LayoutGamesCommon, LayoutEaster } from "dc-ranges-types";

interface StarsLayoutProps {
    layout: LayoutGamesCommon | LayoutEaster;
}
export default function StarsLayout({ layout }: StarsLayoutProps): React.JSX.Element {
    if (!layout) return <></>;
    switch (layout.mode) {
        case "easter":
            return <image href={easter.src} x={-176 / 2} y={-176 / 2} width={176} height={176} />
        case "winter":
            return <image href={winter.src} x={-176 / 2} y={-176 / 2} width={176} height={176} />
        case "stars":
            switch (layout.type) {
                case "pistol":
                    return <image href={starsPistol.src} x={-176 / 2} y={-176 / 2} width={176} height={176} />
                case "rifle":
                    return <image href={starsRifle.src} x={-176 / 2} y={-176 / 2} width={176} height={176} />
                default:
                    return <></>;
            }
        default:
            return <></>;
    }
}

export function getSizeFixed(range: Range): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const round = range.discipline.rounds[range.round];
    if (!round) return [0, 0];
    const layout = round.layout;
    if (!layout) return [0, 0];
    if (layout.mode !== "stars" && layout.mode !== "easter" && layout.mode !== "winter") return [0, 0];
    return [176, 176];
}

export function getHitColor(ring: number, isLatest: boolean): string {
    return "#FFFF00";
}
