export type Zoom = ZoomFixed | ZoomAuto | ZoomNone;

type ZoomFixed = {
    mode: "fixed",
    value: number,
}

type ZoomAuto = {
    mode: "auto",
}

type ZoomNone = {
    mode: "none",
}


export function isZoom(zoom: any): zoom is Zoom {
    if (typeof zoom !== "object") return false;
    if (typeof zoom.mode !== "string") return false;
    if (zoom.mode === "fixed" && typeof zoom.value !== "number") return false;
    return true;
}