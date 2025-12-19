import { RangeId } from "../common.js";

type BaseCondition = {
    invert: boolean;
    type: string;
}

export type ConditionMinMax = BaseCondition & {
    type: "ranges_free_count" | "ranges_online_count";
    min: RangeId | null;
    max: RangeId | null;
}

export type ConditionNumber = BaseCondition & {
    type: "range_free" | "range_online";
    number: RangeId;
}

export type ConditionNone = BaseCondition & {
    type: "all_ranges_free" | "shootmaster_available";
}