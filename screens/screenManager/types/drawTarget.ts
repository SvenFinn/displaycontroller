import { BaseDbScreen, BaseScreenAvailable, isBaseDbScreen, isBaseScreenAvailable } from "./base";

export type DrawTargetDbScreen = BaseDbScreen & {
    preset: "drawTarget";
    options: DrawTargetOptions;
}

export function isDrawTargetDbScreen(screen: any): screen is DrawTargetDbScreen {
    if (!isBaseDbScreen(screen)) return false;
    if (screen.preset !== "drawTarget") return false;
    if (typeof screen.options !== "object") return false;
    if (!isDrawTargetOptions(screen.options)) return false;
    return true;
}

export type DrawTargetOptions = {
    rows: number;
    columns: number;
    ranges: Array<number>;
    highlightAssign: boolean;
}

export function isDrawTargetOptions(options: any): options is DrawTargetOptions {
    if (typeof options !== "object") return false;
    if (typeof options.rows !== "number") return false;
    if (typeof options.columns !== "number") return false;
    if (!Array.isArray(options.ranges)) return false;
    if (typeof options.highlightAssign !== "boolean") return false;
    return true;
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
    if (!isDrawTargetOptions(screenWType.options)) return false;
    return true;
}