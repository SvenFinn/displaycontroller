import { BaseDbScreen, BaseScreenAvailable } from './base';

export type SystemMessageScreen = BaseScreenAvailable & {
    preset: "systemMessage";
    options: Ssmdb2MessageOptions | IncompatibleMessageOptions | InvalidScreenOptions | SMDBAccessMessageOptions;
}

export type SystemMessageDbScreen = BaseDbScreen & {
    preset: "systemMessage";
    options: Ssmdb2MessageOptions | IncompatibleMessageOptions | InvalidScreenOptions | SMDBAccessMessageOptions;
}

export type Ssmdb2MessageOptions = {
    type: "ssmdb2";
}

export type IncompatibleMessageOptions = {
    type: "serverIncompatible";
    serverVersion: string;
}

export type InvalidScreenOptions = {
    type: "invalidScreen";
    id: number;
    preset: string;
}

export type SMDBAccessMessageOptions = {
    type: "SMDBAccess";
}
