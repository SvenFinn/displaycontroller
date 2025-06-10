import { LayoutRings } from "@shared/ranges/discipline/layout/rings";
import Ring from "./ring";
import { Range } from "@shared/ranges";

interface RingsProps {
    layout: LayoutRings,
    color: string
}

export default function Rings({ layout, color }: RingsProps): React.JSX.Element {
    if (!layout) return <></>;
    const layoutCopy = layout.rings.slice().reverse();
    return (
        <g>
            {layoutCopy.map((ring, index) => (
                <Ring key={index} ring={ring} printText={index < layoutCopy.length - 2} nextDiameter={layoutCopy[index + 1]?.diameter} color={color} />
            ))}
        </g>
    )
}

export function getSizeFixed(range: Range): [number, number] {
    if (!range.active) return [0, 0];
    if (!range.discipline) return [0, 0];
    const round = range.discipline.rounds[range.round];
    if (!round) return [0, 0];
    const zoom = round.zoom;
    const layout = range.discipline.layouts[round.layoutId];
    if (!layout) return [0, 0];
    if (layout.mode !== "rings") return [0, 0];
    const rings = layout.rings;

    let index = rings.length - 1;
    if (zoom.mode === "fixed") {
        index = rings.findIndex(ring => ring.value === zoom.value);
    }
    if (index === -1) return [0, 0];


    const diameter = rings[rings.length - 1].diameter;
    return [diameter, diameter];
}

// This function needs to be defined per layout, as the custom layouts
// Should be able to define the hit color
export function getHitColor(ring: number, isLatest: boolean): string {
    if (!isLatest) return "#000000";
    if (ring >= 10) return "#FF0000";
    if (ring >= 9) return "#FFFF00";
    return "#0000FF";
}