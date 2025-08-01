export type DisciplineRoundMode = ModeBase | ModeDecimals | ModeTarget;

type ModeDecimals = {
    mode: "rings" | "divider" | "ringsDiv",
    decimals: number
}

type ModeBase = {
    mode: "circle" | "fullHidden" | "hidden" | "hundred" | "decimal"
}

type ModeTarget = {
    mode: "target"
    decimals: number,
    value: number,
    exact: boolean
}

export function isDisciplineRoundModeBase(disciplineRoundMode: any): disciplineRoundMode is ModeBase {
    if (typeof disciplineRoundMode !== "object") return false;
    if (typeof disciplineRoundMode.mode !== "string") return false;
    if (disciplineRoundMode.mode !== "circle" && disciplineRoundMode.mode !== "fullHidden" && disciplineRoundMode.mode !== "hidden" && disciplineRoundMode.mode !== "hundred" && disciplineRoundMode.mode !== "decimal") return false;
    return true;
}

export function isDisciplineRoundModeDecimals(disciplineRoundMode: any): disciplineRoundMode is ModeDecimals {
    if (typeof disciplineRoundMode !== "object") return false;
    if (typeof disciplineRoundMode.mode !== "string") return false;
    if (disciplineRoundMode.mode !== "rings" && disciplineRoundMode.mode !== "divider" && disciplineRoundMode.mode !== "ringsDiv") return false;
    if (typeof disciplineRoundMode.decimals !== "number") return false;
    return true;
}

export function isDisciplineRoundModeTarget(disciplineRoundMode: any): disciplineRoundMode is ModeTarget {
    if (typeof disciplineRoundMode !== "object") return false;
    if (typeof disciplineRoundMode.mode !== "string") return false;
    if (disciplineRoundMode.mode !== "target") return false;
    if (typeof disciplineRoundMode.decimals !== "number") return false;
    if (typeof disciplineRoundMode.value !== "number") return false;
    if (typeof disciplineRoundMode.exact !== "boolean") return false;
    return true;
}

export function isDisciplineRoundMode(disciplineRoundMode: any): disciplineRoundMode is DisciplineRoundMode {
    return isDisciplineRoundModeBase(disciplineRoundMode) || isDisciplineRoundModeDecimals(disciplineRoundMode) || isDisciplineRoundModeTarget(disciplineRoundMode);
}