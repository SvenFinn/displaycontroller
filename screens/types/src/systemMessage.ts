import { ScreenId } from './common.js';
import { BaseScreenAvailable } from './base.js';

export type SystemMessageScreen = BaseScreenAvailable & {
    type: "systemMessage";
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
    id: ScreenId;
    screenType: string;
}

export type SMDBAccessMessageOptions = {
    type: "SMDBAccess";
}
