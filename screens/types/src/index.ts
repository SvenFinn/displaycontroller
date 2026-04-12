import { ScreenUnavailable } from "./base.js";
import { CpcViewScreen, CpcViewDbScreen, CpcViewOptions, isCpcViewOptions } from "./cpcView.js";
import { EmbedDbScreen, EmbedScreen, EmbedOptions } from "./embed.js";
import { DrawTargetScreen, DrawTargetDbScreen, DrawTargetOptions, isDrawTargetOptions } from "./drawTarget.js";
import { EvaluationScreen, EvaluationDbScreen, EvaluationOptions, isEvaluationOptions } from "./evaluation.js";
import { ViewerScreen, ViewerDbScreen, ViewerOptions, isViewerOptions } from "./imageViewer.js";
import { SystemMessageScreen } from "./systemMessage.js";
import { ConditionNone, ConditionNumber, ConditionMinMax } from "./conditions/base.js";
import { createIs } from "typia";
import { ScreenCastScreen } from "./screenCast.js";

export type ScreenAvailable = ViewerScreen | CpcViewScreen | DrawTargetScreen | EvaluationScreen | SystemMessageScreen | EmbedScreen | ScreenCastScreen;

export type Screen = ScreenAvailable | ScreenUnavailable;

export type DbScreen = ViewerDbScreen | CpcViewDbScreen | DrawTargetDbScreen | EvaluationDbScreen | EmbedDbScreen;

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
    SystemMessageScreen,
    EmbedDbScreen,
    EmbedScreen,
    EmbedOptions
}