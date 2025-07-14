type BaseCondition = {
    invert: boolean;
    type: string;
}

export type ConditionMinMax = BaseCondition & {
    type: "ranges_free_count" | "ranges_online_count";
    min: number;
    max: number;
}

export type ConditionNumber = BaseCondition & {
    type: "range_free" | "range_online";
    number: number;
}

export type ConditionNone = BaseCondition & {
    type: "all_ranges_free" | "meyton_available";
}