import { createIs } from "typia";
import { BaseDbScreen, BaseScreenAvailable } from "./base";

export type CpcViewDbScreen = BaseDbScreen & {
    type: "cpcView";
    options: CpcViewOptions
}

export type CpcViewOptions = {
    "rows": number;
    "columns": number;
    "ranges": Array<number | null>;
}

export const isCpcViewOptions = createIs<CpcViewOptions>();

export type CpcViewScreen = BaseScreenAvailable & {
    type: "cpcView";
    options: CpcViewOptions;
};