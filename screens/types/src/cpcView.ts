import { createIs } from "typia";
import { BaseDbScreen, BaseScreenAvailable } from "./base";
import { PositiveInteger, RangeId } from "./common";

export type CpcViewDbScreen = BaseDbScreen & {
    type: "cpcView";
    options: CpcViewOptions
}

export type CpcViewOptions = {
    "rows": PositiveInteger;
    "columns": PositiveInteger;
    "ranges": Array<RangeId | null>;
}

export const isCpcViewOptions = createIs<CpcViewOptions>();

export type CpcViewScreen = BaseScreenAvailable & {
    type: "cpcView";
    options: CpcViewOptions;
};