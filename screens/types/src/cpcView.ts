import { BaseDbScreen, BaseScreenAvailable } from "./base";

export type CpcViewDbScreen = BaseDbScreen & {
    preset: "cpcView";
    options: CpcViewMultiOptions | CpcViewSingleOptions;
}

type CpcViewSingleOptions = {
    mode: "single";
    range: number;
}

type CpcViewMultiOptions = {
    mode: "multi";
    ranges: Array<number>;
}

export type CpcViewScreen = BaseScreenAvailable & {
    preset: "cpcView";
    options: CpcViewMultiOptions | CpcViewSingleOptions;
}