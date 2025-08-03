import { createIs } from "typia";
import { BaseDbScreen, BaseScreenAvailable } from "./base";

export type EvaluationDbScreen = BaseDbScreen & {
    type: "evaluation";
    options: EvaluationOptions;
}

export type EvaluationOptions = {
    path: string;
}

export const isEvaluationOptions = createIs<EvaluationOptions>();

export type EvaluationScreen = BaseScreenAvailable & {
    type: "evaluation";
    options: EvaluationOptions;
}