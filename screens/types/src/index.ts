import { ScreenUnavailable } from "./base";
import { CpcViewScreen, CpcViewDbScreen, CpcViewOptions, isCpcViewOptions } from "./cpcView";
import { EmbedDbScreen, EmbedScreen, EmbedOptions } from "./embed";
import { DrawTargetScreen, DrawTargetDbScreen, DrawTargetOptions, isDrawTargetOptions } from "./drawTarget";
import { EvaluationScreen, EvaluationDbScreen, EvaluationOptions, isEvaluationOptions } from "./evaluation";
import { ViewerScreen, ViewerDbScreen, ViewerOptions, isViewerOptions } from "./imageViewer";
import { SystemMessageDbScreen, SystemMessageScreen } from "./systemMessage";
import { ConditionNone, ConditionNumber, ConditionMinMax } from "./conditions/base";
import { createIs } from "typia";
import { ScreenCastDbScreen, ScreenCastScreen } from "./screenCast";

export type ScreenAvailable = ViewerScreen | CpcViewScreen | DrawTargetScreen | EvaluationScreen | SystemMessageScreen | EmbedScreen | ScreenCastScreen;

export type Screen = ScreenAvailable | ScreenUnavailable;

export type DbScreen = ViewerDbScreen | CpcViewDbScreen | DrawTargetDbScreen | EvaluationDbScreen | SystemMessageDbScreen | EmbedDbScreen | ScreenCastDbScreen;

export const isDbScreen = createIs<DbScreen>();
export const isScreen = createIs<Screen>();

export {
    ConditionNone,
    ConditionNumber,
    ConditionMinMax,
    DrawTargetDbScreen,
    DrawTargetScreen,
    DrawTargetOptions,
    isDrawTargetOptions,
    CpcViewDbScreen,
    CpcViewOptions,
    isCpcViewOptions,
    CpcViewScreen,
    ViewerDbScreen,
    ViewerScreen,
    ViewerOptions,
    isViewerOptions,
    EvaluationDbScreen,
    EvaluationScreen,
    EvaluationOptions,
    isEvaluationOptions,
    SystemMessageDbScreen,
    SystemMessageScreen,
    EmbedDbScreen,
    EmbedScreen,
    EmbedOptions
}