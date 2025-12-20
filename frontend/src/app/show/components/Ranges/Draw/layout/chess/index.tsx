import { LayoutChess } from "dc-ranges-types";

import chessFive from "./5x5.svg";
import chessSix from "./6x6.svg";
import chessSeven from "./7x7.svg";
import chessTen from "./10x10.svg";
import { LayoutInterface } from "..";

export const layoutChess: LayoutInterface<LayoutChess> = {
    getHitColor(hit, isLatest) {
        return "#0000FF";
    },
    getSizeFixed(layout, value) {
        return this.getSizeNone(layout);
    },
    getSizeNone(layout) {
        if (layout.type === "rifle") {
            switch (layout.size) {
                case 5:
                case 10:
                    return [85.5, 85.5];
                case 6:
                case 7:
                    return [90, 90];
                default:
                    return [0, 0];
            }
        } else if (layout.type === "pistol") {
            switch (layout.size) {
                case 5:
                case 10:
                    return [120.5, 120.5];
                case 6:
                case 7:
                    return [125, 125];
                default:
                    return [0, 0];
            }
        }
        return [0, 0];
    },
    render({ layout, color }) {
        const dimensions = this.getSizeNone(layout);

        const srcs = (() => {
            switch (layout.size) {
                case 5: chessFive.src;
                case 6: chessSix.src;
                case 7: chessSeven.src;
                case 10: chessTen.src;
                default: return "";
            }
        })();

        return <image href={srcs} x={-dimensions[0] / 2} y={-dimensions[1] / 2} width={dimensions[0]} height={dimensions[1]} />
    }
}
