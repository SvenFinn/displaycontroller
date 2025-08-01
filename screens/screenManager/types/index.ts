import { ScreenUnavailable, isScreenUnavailable } from "./base";
import { CpcViewScreen, isCpcViewScreen, CpcViewDbScreen, isCpcViewDbScreen } from "./cpcView";
import { CustomURLDbScreen, CustomURLScreen, isCustomURLDbScreen, isCustomURLScreen } from "./customURL";
import { DrawTargetScreen, isDrawTargetScreen, DrawTargetDbScreen, isDrawTargetDbScreen } from "./drawTarget";
import { EvaluationScreen, isEvaluationScreen, EvaluationDbScreen, isEvaluationDbScreen } from "./evaluation";
import { ViewerScreen, isViewerScreen, ViewerDbScreen, isViewerDbScreen } from "./imageViewer";
import { SystemMessageDbScreen, SystemMessageScreen, isSystemMessageScreen } from "./systemMessage";

export type ScreenAvailable = ViewerScreen | CpcViewScreen | DrawTargetScreen | EvaluationScreen | SystemMessageScreen | CustomURLScreen;

export type Screen = ScreenAvailable | ScreenUnavailable;

export function isScreenAvailable(screen: any): screen is ScreenAvailable {
    return isViewerScreen(screen) || isCpcViewScreen(screen) || isDrawTargetScreen(screen) || isEvaluationScreen(screen) || isSystemMessageScreen(screen) || isCustomURLScreen(screen);
}

export function isScreen(screen: any): screen is Screen {
    return isScreenAvailable(screen) || isScreenUnavailable(screen);
}

export type DbScreen = ViewerDbScreen | CpcViewDbScreen | DrawTargetDbScreen | EvaluationDbScreen | SystemMessageDbScreen | CustomURLDbScreen;

export function isDbScreen(screen: any): screen is DbScreen {
    return isViewerDbScreen(screen) || isCpcViewDbScreen(screen) || isDrawTargetDbScreen(screen) || isEvaluationDbScreen(screen) || isCustomURLDbScreen(screen);
}