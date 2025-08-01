import { BaseDbScreen, BaseScreenAvailable, isBaseDbScreen, isBaseScreenAvailable } from "./base";

export type DrawTargetDbScreen = BaseDbScreen & {
    preset: "drawTarget";
    options: DrawTargetOptions;
}

export function isDrawTargetDbScreen(screen: any): screen is DrawTargetDbScreen {
    if (!isBaseDbScreen(screen)) return false;
    if (screen.preset !== "drawTarget") return false;
    const screenWType = screen as DrawTargetDbScreen;
    if (typeof screenWType.options !== "object") return false;
    if (!Array.isArray(screenWType.options.ranges)) return false;
    if (typeof screenWType.options.highlightAssign !== "boolean") return false;
    if (typeof screenWType.options.rows !== "number") return false;
    if (typeof screenWType.options.columns !== "number") return false;
    return true;
}

export type DrawTargetOptions = {
    rows: number;
    columns: number;
    ranges: Array<number>;
    highlightAssign: boolean;
}

export type DrawTargetScreen = BaseScreenAvailable & {
    preset: "drawTarget";
    options: DrawTargetOptions;
}

export function isDrawTargetScreen(screen: any): screen is DrawTargetScreen {
    if (!isBaseScreenAvailable(screen)) return false;
    if (screen.preset !== "drawTarget") return false;
    const screenWType = screen as DrawTargetScreen;
    if (typeof screenWType.options !== "object") return false;
    if (!Array.isArray(screenWType.options.ranges)) return false;
    if (typeof screenWType.options.highlightAssign !== "boolean") return false;
    if (typeof screenWType.options.rows !== "number") return false;
    if (typeof screenWType.options.columns !== "number") return false;
    return true;
}