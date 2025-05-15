export type DisciplineLayouts = {
    [layoutId: number]: DisciplineLayout;
}

export type DisciplineLayout = DisciplineLayoutRings | DisciplineLayoutCustom;

export type DisciplineLayoutRings = {
    mode: "rings";
    rings: DisciplineLayoutRing[];
}

export type DisciplineLayoutRing = {
    value: number;
    diameter: number;
    colored: boolean;
}

export type DisciplineLayoutCustom = DisciplineLayoutCustomCommon | DisciplineLayoutChess | DisciplineLayoutEaster;

export type DisciplineLayoutCustomCommon = {
    mode: "dart" | "stars"
    type: "rifle" | "pistol";
}

export type DisciplineLayoutChess = {
    mode: "chess";
    type: "rifle" | "pistol";
    size: number;
}

export type DisciplineLayoutEaster = {
    mode: "easter";
}

export function isDisciplineLayouts(disciplineLayouts: any): disciplineLayouts is DisciplineLayouts {
    if (typeof disciplineLayouts !== "object") return false;
    if (Array.isArray(disciplineLayouts)) return false;
    for (const layoutId in disciplineLayouts) {
        if (isNaN(Number(layoutId))) return false;
        if (!isDisciplineLayout(disciplineLayouts[layoutId])) return false;
    }
    return true;
}

export function isDisciplineLayout(disciplineLayout: any): disciplineLayout is DisciplineLayout {
    return isDisciplineLayoutRings(disciplineLayout) || isDisciplineLayoutCommon(disciplineLayout) || isDisciplineLayoutChess(disciplineLayout) || isDisciplineLayoutEaster(disciplineLayout);
}

export function isDisciplineLayoutRings(disciplineLayout: any): disciplineLayout is DisciplineLayoutRings {
    if (typeof disciplineLayout !== "object") return false;
    if (Array.isArray(disciplineLayout)) return false;
    if (disciplineLayout.mode !== "rings") return false;
    if (!Array.isArray(disciplineLayout.rings)) return false;
    for (const ring of disciplineLayout.rings) {
        if (typeof ring.value !== "number") return false;
        if (typeof ring.diameter !== "number") return false;
        if (typeof ring.colored !== "boolean") return false;
    }
    return true;
}

export function isDisciplineLayoutCommon(disciplineLayout: any): disciplineLayout is DisciplineLayoutCustom {
    if (typeof disciplineLayout !== "object") return false;
    if (Array.isArray(disciplineLayout)) return false;
    if (disciplineLayout.mode !== "dart" && disciplineLayout.mode !== "stars") return false;
    if (disciplineLayout.type !== "rifle" && disciplineLayout.type !== "pistol") return false;
    return true;
}

export function isDisciplineLayoutChess(disciplineLayout: any): disciplineLayout is DisciplineLayoutChess {
    if (typeof disciplineLayout !== "object") return false;
    if (Array.isArray(disciplineLayout)) return false;
    if (disciplineLayout.mode !== "chess") return false;
    if (disciplineLayout.type !== "rifle" && disciplineLayout.type !== "pistol") return false;
    if (typeof disciplineLayout.size !== "number") return false;
    return true;
}

export function isDisciplineLayoutEaster(disciplineLayout: any): disciplineLayout is DisciplineLayoutEaster {
    if (typeof disciplineLayout !== "object") return false;
    if (Array.isArray(disciplineLayout)) return false;
    if (disciplineLayout.mode !== "easter") return false;
    return true;
}

