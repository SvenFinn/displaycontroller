import { DisciplineLayoutCustomCommon } from "@shared/ranges/discipline/layout";
import pistol from "./pistol.svg";
import rifle from "./rifle.svg";
import { Range } from "@shared/ranges";

interface DartLayoutProps {
    layout: DisciplineLayoutCustomCommon
}
export default function DartLayout({ layout }: DartLayoutProps): React.JSX.Element {
    console.log(pistol);
    if (!layout) return <></>;
    if (layout.mode !== "dart") return <></>;

    if (layout.type === "pistol") {
        return <image href={pistol.src} x={-6250} y={-6250} width={12500} height={12500} />
    }
    else {
        return <image href={rifle.src} x={-4500} y={-4500} width={9000} height={9000} />
    }
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
