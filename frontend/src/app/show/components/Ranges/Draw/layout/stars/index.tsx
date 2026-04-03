import starsRifle from "./starsLg.svg";
import starsPistol from "./starsLp.svg";
import easter from "./easter.svg";
import winter from "./winter.svg";

import { Range, LayoutEaster, LayoutStars } from "dc-ranges/types";
import { LayoutInterface } from "..";


export const layoutStars: LayoutInterface<LayoutStars | LayoutEaster> = {
    getHitColor(hit, isLatest) {
        return "#FFFF00";
    },
    getSizeNone(layout) {
        return [176, 176];
    },
    getSizeFixed(layout, value) {
        return this.getSizeNone(layout);
    },
    render({ layout }) {
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
}