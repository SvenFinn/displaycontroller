export type LayoutRings = {
    mode: "rings";
    rings: LayoutRing[];
}

export type LayoutRing = {
    value: number;
    diameter: number;
    colored: boolean;
}

export function isLayoutRings(layout: any): layout is LayoutRings {
    if (typeof layout !== "object") return false;
    if (Array.isArray(layout)) return false;
    if (layout.mode !== "rings") return false;
    if (!Array.isArray(layout.rings)) return false;
    for (const ring of layout.rings) {
        if (typeof ring.value !== "number") return false;
        if (typeof ring.diameter !== "number") return false;
        if (typeof ring.colored !== "boolean") return false;
    }
    return true;
}