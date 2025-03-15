import { BaseDbScreen, BaseScreenAvailable } from './base';

export type SystemMessageScreen = BaseScreenAvailable & {
    preset: "systemMessage";
    options: Ssmdb2MessageOptions | IncompatibleMessageOptions | InvalidScreenOptions;
}

export function isSystemMessageScreen(screen: any): screen is SystemMessageScreen {
    if (!screen) return false;
    if (screen.preset !== "systemMessage") return false;
    const screenWType = screen as SystemMessageScreen;
    if (isSsmdb2MessageOptions(screenWType.options)) return true;
    if (isIncompatibleMessageOptions(screenWType.options)) return true;
    if (isInvalidScreenOptions(screenWType.options)) return true;
    return false;
}

export type SystemMessageDbScreen = BaseDbScreen & {
    preset: "systemMessage";
    options: Ssmdb2MessageOptions | IncompatibleMessageOptions | InvalidScreenOptions;
}

export function isSystemMessageDbScreen(screen: any): screen is SystemMessageDbScreen {
    if (!screen) return false;
    if (screen.preset !== "systemMessage") return false;
    const screenWType = screen as SystemMessageDbScreen;
    if (isSsmdb2MessageOptions(screenWType.options)) return true;
    if (isIncompatibleMessageOptions(screenWType.options)) return true;
    if (isInvalidScreenOptions(screenWType.options)) return true;
    return false;
}

export type Ssmdb2MessageOptions = {
    type: "ssmdb2";
}

export function isSsmdb2MessageOptions(options: any): options is Ssmdb2MessageOptions {
    if (!options) return false;
    if (options.type !== "ssmdb2") return false;
    return true;
}

export type IncompatibleMessageOptions = {
    type: "serverIncompatible";
    serverVersion: string;
}

export function isIncompatibleMessageOptions(options: any): options is IncompatibleMessageOptions {
    if (!options) return false;
    if (options.type !== "serverIncompatible") return false;
    const optionsWType = options as IncompatibleMessageOptions;
    if (typeof optionsWType.serverVersion !== "string") return false;
    return true;
}

export type InvalidScreenOptions = {
    type: "invalidScreen";
    id: number;
    preset: string;
}

export function isInvalidScreenOptions(options: any): options is InvalidScreenOptions {
    if (!options) return false;
    if (options.type !== "invalidScreen") return false;
    const optionsWType = options as InvalidScreenOptions;
    if (typeof optionsWType.id !== "number") return false;
    if (typeof optionsWType.preset !== "string") return false;
    return true;
}
