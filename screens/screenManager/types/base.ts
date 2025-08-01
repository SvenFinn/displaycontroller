import { Condition, isScreenCondition } from './conditions';

export type BaseDbScreen = {
    id: number;
    preset: string;
    options: any;
    condition: Condition | null;
    visibleFrom: Date | null;
    visibleUntil: Date | null;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
}

export function isBaseDbScreen(screen: any): screen is BaseDbScreen {
    if (typeof screen !== "object") return false;
    if (typeof screen.id !== "number") return false;
    if (typeof screen.preset !== "string") return false;
    if (typeof screen.options !== "object") return false;
    if (screen.condition && !isScreenCondition(screen.condition)) return false;
    if (typeof screen.duration !== "number") return false;
    if (screen.visibleFrom !== null && !(screen.visibleFrom instanceof Date)) return false;
    if (screen.visibleUntil !== null && !(screen.visibleUntil instanceof Date)) return false;
    if (!(screen.createdAt instanceof Date)) return false;
    if (!(screen.updatedAt instanceof Date)) return false;
    return true;
}

export type BaseScreenAvailable = {
    available: true;
    id: number;
    subId: number;
    preset: string;
    options: Record<string, any>;
    duration: number;
}

export function isBaseScreenAvailable(screen: any): screen is BaseScreenAvailable {
    if (typeof screen !== "object") return false;
    if (typeof screen.available !== "boolean") return false;
    if (typeof screen.id !== "number") return false;
    if (typeof screen.subId !== "number") return false;
    if (typeof screen.preset !== "string") return false;
    if (typeof screen.options !== "object") return false;
    if (typeof screen.duration !== "number") return false;
    return true;
}

export type ScreenUnavailable = {
    available: false;
}

export function isScreenUnavailable(screen: any): screen is ScreenUnavailable {
    return typeof screen === "object" && screen.available === false;
}