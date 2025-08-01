import { BaseDbScreen, BaseScreenAvailable, isBaseDbScreen, isBaseScreenAvailable } from "./base";

export type EvaluationDbScreen = BaseDbScreen & {
    preset: "evaluation";
    options: EvaluationOptions;
}

export function isEvaluationDbScreen(screen: any): screen is EvaluationDbScreen {
    if (!isBaseDbScreen(screen)) return false;
    if (screen.preset !== "evaluation") return false;
    const screenWType = screen as EvaluationDbScreen;
    if (typeof screenWType.options !== "object") return false;
    if (typeof screenWType.options.file !== "string") return false;
    return true;
}

type EvaluationOptions = {
    file: string;
}

export type EvaluationScreen = BaseScreenAvailable & {
    preset: "evaluation";
    options: EvaluationOptions;
}

export function isEvaluationScreen(screen: any): screen is EvaluationScreen {
    if (!isBaseScreenAvailable(screen)) return false;
    if (screen.preset !== "evaluation") return false;
    const screenWType = screen as EvaluationScreen;
    if (typeof screenWType.options !== "object") return false;
    if (typeof screenWType.options.file !== "string") return false;
    return true;
}