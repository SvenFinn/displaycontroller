import { createIs } from "typia";
import { BaseDbScreen, BaseScreenAvailable } from "./base.js";
import { PositiveInteger, RangeId } from "./common.js";

export type DrawTargetDbScreen = BaseDbScreen & {
    type: "drawTarget";
    options: DrawTargetOptions;
}

export type DrawTargetOptions = {
    rows: PositiveInteger;
    columns: PositiveInteger;
    ranges: Array<RangeId | null>;
    highlightAssign: boolean;
}

export const isDrawTargetOptions = createIs<DrawTargetOptions>();

export type DrawTargetScreen = BaseScreenAvailable & {
    type: "drawTarget";
    options: DrawTargetOptions;
}
