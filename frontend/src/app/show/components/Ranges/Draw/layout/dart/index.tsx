import { LayoutDart } from "dc-ranges/types";
import dart from "./dartboard.svg";
import { LayoutInterface } from "..";

export const layoutDart: LayoutInterface<LayoutDart> = {
    getHitColor(ring, isLatest) {
        return "#FFFF00";
    },
    getSizeFixed(layout, value) {
        return this.getSizeNone(layout);
    },
    getSizeNone(layout) {
        if (layout.type === "rifle") {
            return [90, 90];
        } else if (layout.type === "pistol") {
            return [125, 125];
        }
        return [0, 0];
    },
    render({ layout, color }) {
        const size = layout.type === "pistol" ? 125 : 90;
        const corner = -size / 2;

        return <image href={dart.src} x={corner} y={corner} width={size} height={size} />
    }
}