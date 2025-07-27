import { createIs } from "typia";
import { BaseDbScreen, BaseScreenAvailable } from "./base";

export type CpcViewDbScreen = BaseDbScreen & {
    preset: "cpcView";
    options: CpcViewOptions
}

export type CpcViewOptions = {
    "rows": number;
    "columns": number;
    "ranges": Array<number | null>;
}

export const isCpcViewOptions = createIs<CpcViewOptions>();

export type CpcViewScreen = BaseScreenAvailable & {
    preset: "cpcView";
    options: CpcViewOptions;
};