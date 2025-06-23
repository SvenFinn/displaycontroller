import { BaseDbScreen, BaseScreenAvailable, isBaseDbScreen, isBaseScreenAvailable } from "./base";

export type CustomURLDbScreen = BaseDbScreen & {
    preset: "customURL";
    options: CustomURLOptions;
}

export function isCustomURLDbScreen(screen: any): screen is CustomURLDbScreen {
    if (!isBaseDbScreen(screen)) return false;
    if (screen.preset !== "customURL") return false;
    if (typeof screen.options !== "object") return false;
    if (!isCustomURLOptions(screen.options)) return false;
    return true;
}

export type CustomURLOptions = {
    url: string;
}

export function isCustomURLOptions(options: any): options is CustomURLOptions {
    if (typeof options !== "object") return false;
    if (typeof options.url !== "string") return false;
    return true;
}

export type CustomURLScreen = BaseScreenAvailable & {
    preset: "customURL";
    options: CustomURLOptions;
}

export function isCustomURLScreen(screen: any): screen is CustomURLScreen {
    if (!isBaseScreenAvailable(screen)) return false;
    if (screen.preset !== "customURL") return false;
    const screenWType = screen as CustomURLScreen;
    if (typeof screenWType.options !== "object") return false;
    if (!isCustomURLOptions(screenWType.options)) return false;
    return true;
}