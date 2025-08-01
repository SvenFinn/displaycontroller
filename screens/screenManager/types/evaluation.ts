import { BaseDbScreen, BaseScreenAvailable, isBaseDbScreen, isBaseScreenAvailable } from "./base";

export type EvaluationDbScreen = BaseDbScreen & {
    preset: "evaluation";
    options: EvaluationOptions;
}

export function isEvaluationDbScreen(screen: any): screen is EvaluationDbScreen {
    if (!isBaseDbScreen(screen)) return false;
    if (screen.preset !== "evaluation") return false;
    const screenWType = screen as EvaluationDbScreen;
    return isEvaluationOptions(screenWType.options);
}

export type EvaluationOptions = {
    path: string;
}

export function isEvaluationOptions(options: any): options is EvaluationOptions {
    if (typeof options !== "object") return false;
    if (typeof options.path !== "string") return false;
    return true;
}

export type EvaluationScreen = BaseScreenAvailable & {
    preset: "evaluation";
    options: EvaluationOptions;
}

export function isEvaluationScreen(screen: any): screen is EvaluationScreen {
    if (!isBaseScreenAvailable(screen)) return false;
    if (screen.preset !== "evaluation") return false;
    const screenWType = screen as EvaluationScreen;
    return isEvaluationOptions(screenWType.options);
}