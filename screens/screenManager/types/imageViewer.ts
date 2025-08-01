import { BaseDbScreen, BaseScreenAvailable, isBaseDbScreen, isBaseScreenAvailable } from "./base";

export type ViewerDbScreen = BaseDbScreen & {
    preset: "imageViewer";
    options: ViewerOptions;
}



export function isViewerDbScreen(screen: any): screen is ViewerDbScreen {
    if (!isBaseDbScreen(screen)) return false;
    if (screen.preset !== "imageViewer") return false;
    const screenWType = screen as ViewerDbScreen;
    return isViewerOptions(screenWType.options);
}

export type ViewerScreen = BaseScreenAvailable & {
    preset: "imageViewer";
    options: ViewerOptions;
}

export function isViewerScreen(screen: any): screen is ViewerScreen {
    if (!isBaseScreenAvailable(screen)) return false;
    if (screen.preset !== "imageViewer") return false;
    const screenWType = screen as ViewerScreen;
    return isViewerOptions(screenWType.options);
}

export type ViewerOptions = {
    path: string;
}

export function isViewerOptions(options: any): options is ViewerOptions {
    if (typeof options !== "object") return false;
    if (typeof options.path !== "string") return false;
    return true;
}