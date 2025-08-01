
export type LayoutRectangle = {
    mode: "rectangle";
    x: number;
    y: number;
    width: number;
    height: number;
}

export function isLayoutRectangle(layout: any): layout is LayoutRectangle {
    if (typeof layout !== "object") return false;
    if (Array.isArray(layout)) return false;
    if (layout.mode !== "rectangle") return false;
    if (typeof layout.x !== "number") return false;
    if (typeof layout.y !== "number") return false;
    if (typeof layout.width !== "number") return false;
    if (typeof layout.height !== "number") return false;
    return true;
}