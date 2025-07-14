import { BaseDbScreen, BaseScreenAvailable } from "./base";

export type CustomURLDbScreen = BaseDbScreen & {
    preset: "customURL";
    options: CustomURLOptions;
}

export type CustomURLOptions = {
    url: string;
}

export type CustomURLScreen = BaseScreenAvailable & {
    preset: "customURL";
    options: CustomURLOptions;
}