import { LayoutRectangle } from "dc-ranges/types";
import { LayoutInterface } from "..";
import { layoutRings } from "../rings";

export const layoutRectangle: LayoutInterface<LayoutRectangle> = {
    getHitColor(hit, isLatest) {
        return layoutRings.getHitColor(hit, isLatest);
    },
    getSizeNone(layout) {
        // How do we handle x and y here?
        const realWidth = layout.x + layout.width;
        const realHeight = layout.y + layout.height;
        return [realWidth * 2, realHeight * 2];
    },
    getSizeFixed(layout, value) {
        return this.getSizeNone(layout);
    },
    render({ layout, color }) {
        const { x, y, width, height } = layout;
        return (
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={color}
                stroke="black"
            />
        )
    }
}