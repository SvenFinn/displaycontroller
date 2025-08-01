import { ScreenUnavailable, isScreenUnavailable } from "./base";
import { CpcViewScreen, isCpcViewScreen, CpcViewDbScreen, isCpcViewDbScreen } from "./cpcView";
import { DrawTargetScreen, isDrawTargetScreen, DrawTargetDbScreen, isDrawTargetDbScreen } from "./drawTarget";
import { EvaluationScreen, isEvaluationScreen, EvaluationDbScreen, isEvaluationDbScreen } from "./evaluation";
import { ViewerScreen, isViewerScreen, ViewerDbScreen, isViewerDbScreen } from "./imageViewer";
import { EvaluationGalleryDbScreen, isEvaluationGalleryDbScreen } from "./evaluationGallery";
import { SystemMessageDbScreen, SystemMessageScreen, isSystemMessageScreen } from "./systemMessage";

export type ScreenAvailable = ViewerScreen | CpcViewScreen | DrawTargetScreen | EvaluationScreen | SystemMessageScreen;

export type Screen = ScreenAvailable | ScreenUnavailable;

export function isScreenAvailable(screen: any): screen is ScreenAvailable {
    return isViewerScreen(screen) || isCpcViewScreen(screen) || isDrawTargetScreen(screen) || isEvaluationScreen(screen) || isSystemMessageScreen(screen);
}

export function isScreen(screen: any): screen is Screen {
    return isScreenAvailable(screen) || isScreenUnavailable(screen);
}

export type DbScreen = ViewerDbScreen | CpcViewDbScreen | DrawTargetDbScreen | EvaluationDbScreen | EvaluationGalleryDbScreen | SystemMessageDbScreen;

export function isDbScreen(screen: any): screen is DbScreen {
    return isViewerDbScreen(screen) || isCpcViewDbScreen(screen) || isDrawTargetDbScreen(screen) || isEvaluationDbScreen(screen) || isEvaluationGalleryDbScreen(screen);
}