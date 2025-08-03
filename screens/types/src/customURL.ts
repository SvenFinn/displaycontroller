import { BaseDbScreen, BaseScreenAvailable } from "./base";

export type CustomURLDbScreen = BaseDbScreen & {
    type: "customURL";
    options: CustomURLOptions;
}

export type CustomURLOptions = {
    url: string;
}

export type CustomURLScreen = BaseScreenAvailable & {
    type: "customURL";
    options: CustomURLOptions;
}