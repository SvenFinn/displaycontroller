import { LayoutRings, Range } from "dc-ranges/types";
import Ring from "./ring";
import { LayoutInterface } from "..";

export const layoutRings: LayoutInterface<LayoutRings> = {
    getHitColor(hit, isLatest) {
        if (!isLatest) return "#000000";
        if (hit.rings >= 10) return "#FF0000";
        if (hit.rings >= 9) return "#FFFF00";
        return "#0000FF";
    },
    getSizeNone(layout) {
        const rings = layout.rings;
        const diameter = rings[rings.length - 1].diameter;
        return [diameter, diameter];
    },
    getSizeFixed(layout, value) {
        const rings = layout.rings;
        let index = rings.findIndex(ring => ring.value === value);
        if (index === -1) index = rings.length - 1;
        const diameter = rings[index].diameter;
        return [diameter, diameter];
    },
    render({ layout, color }) {
        const layoutCopy = layout.rings.slice().reverse();
        return (
            <g>
                {layoutCopy.map((ring, index) => (
                    <Ring key={index} ring={ring} printText={index < layoutCopy.length - 2} nextDiameter={layoutCopy[index + 1]?.diameter} color={color} />
                ))}
            </g>
        )
    }
}