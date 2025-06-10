export type Mode = ModeBase | ModeDecimals | ModeTarget;

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

export function isModeBase(mode: any): mode is ModeBase {
    if (typeof mode !== "object") return false;
    if (typeof mode.mode !== "string") return false;
    if (mode.mode !== "circle" && mode.mode !== "fullHidden" && mode.mode !== "hidden" && mode.mode !== "hundred" && mode.mode !== "decimal") return false;
    return true;
}

export function isModeDecimals(mode: any): mode is ModeDecimals {
    if (typeof mode !== "object") return false;
    if (typeof mode.mode !== "string") return false;
    if (mode.mode !== "rings" && mode.mode !== "divider" && mode.mode !== "ringsDiv") return false;
    if (typeof mode.decimals !== "number") return false;
    return true;
}

export function isModeTarget(mode: any): mode is ModeTarget {
    if (typeof mode !== "object") return false;
    if (typeof mode.mode !== "string") return false;
    if (mode.mode !== "target") return false;
    if (typeof mode.decimals !== "number") return false;
    if (typeof mode.value !== "number") return false;
    if (typeof mode.exact !== "boolean") return false;
    return true;
}

export function isMode(mode: any): mode is Mode {
    return isModeBase(mode) || isModeDecimals(mode) || isModeTarget(mode);
}