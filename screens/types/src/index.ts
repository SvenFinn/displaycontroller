import { ScreenUnavailable } from "./base";
import { CpcViewScreen, CpcViewDbScreen, CpcViewOptions, isCpcViewOptions } from "./cpcView";
import { CustomURLDbScreen, CustomURLScreen, CustomURLOptions } from "./customURL";
import { DrawTargetScreen, DrawTargetDbScreen, DrawTargetOptions, isDrawTargetOptions } from "./drawTarget";
import { EvaluationScreen, EvaluationDbScreen, EvaluationOptions, isEvaluationOptions } from "./evaluation";
import { ViewerScreen, ViewerDbScreen, ViewerOptions, isViewerOptions } from "./imageViewer";
import { SystemMessageDbScreen, SystemMessageScreen } from "./systemMessage";
import { ConditionNone, ConditionNumber, ConditionMinMax } from "./conditions/base";
import { createIs } from "typia";

export type ScreenAvailable = ViewerScreen | CpcViewScreen | DrawTargetScreen | EvaluationScreen | SystemMessageScreen | CustomURLScreen;

export type Screen = ScreenAvailable | ScreenUnavailable;

export type DbScreen = ViewerDbScreen | CpcViewDbScreen | DrawTargetDbScreen | EvaluationDbScreen | SystemMessageDbScreen | CustomURLDbScreen;

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
    CustomURLDbScreen,
    CustomURLScreen,
    CustomURLOptions,

}