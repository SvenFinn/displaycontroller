import { createIs } from "typia";
import { BaseDbScreen, BaseScreenAvailable } from "./base";

export type DrawTargetDbScreen = BaseDbScreen & {
    preset: "drawTarget";
    options: DrawTargetOptions;
}

export type DrawTargetOptions = {
    rows: number;
    columns: number;
    ranges: Array<number | null>;
    highlightAssign: boolean;
}

export const isDrawTargetOptions = createIs<DrawTargetOptions>();

export type DrawTargetScreen = BaseScreenAvailable & {
    preset: "drawTarget";
    options: DrawTargetOptions;
}
