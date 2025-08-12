import { BaseDbScreen, BaseScreenAvailable } from "./base";

export type EmbedDbScreen = BaseDbScreen & {
    type: "embed";
    options: EmbedOptions;
}

export type EmbedOptions = {
    url: string;
}

export type EmbedScreen = BaseScreenAvailable & {
    type: "embed";
    options: EmbedOptions;
}