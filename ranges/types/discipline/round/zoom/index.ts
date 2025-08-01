export type DisciplineRoundZoom = DisciplineRoundZoomFixed | DisciplineRoundZoomAuto | DisciplineRoundZoomNone;

type DisciplineRoundZoomFixed = {
    mode: "fixed",
    value: number,
}

type DisciplineRoundZoomAuto = {
    mode: "auto",
}

type DisciplineRoundZoomNone = {
    mode: "none",
}


export function isDisciplineRoundZoom(disciplineRoundZoom: any): disciplineRoundZoom is DisciplineRoundZoom {
    if (typeof disciplineRoundZoom !== "object") return false;
    if (typeof disciplineRoundZoom.mode !== "string") return false;
    if (disciplineRoundZoom.mode === "fixed" && typeof disciplineRoundZoom.value !== "number") return false;
    return true;
}