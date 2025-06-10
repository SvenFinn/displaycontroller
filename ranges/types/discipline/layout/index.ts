import { LayoutRings, isLayoutRings } from "./rings";
import { LayoutGames, isLayoutGames } from "./games";
import { isLayoutRectangle, LayoutRectangle } from "./rectangle";

export type Layouts = {
    [layoutId: number]: Layout;
}

export type Layout = LayoutRings | LayoutGames | LayoutRectangle;

export function isLayouts(layouts: any): layouts is Layouts {
    if (typeof layouts !== "object") return false;
    if (Array.isArray(layouts)) return false;
    for (const layoutId in layouts) {
        if (isNaN(Number(layoutId))) return false;
        if (!isLayout(layouts[layoutId])) return false;
    }
    return true;
}

export function isLayout(layout: any): layout is Layout {
    return isLayoutRings(layout) || isLayoutGames(layout) || isLayoutRectangle(layout);
}


