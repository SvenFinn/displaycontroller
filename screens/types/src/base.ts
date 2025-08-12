import { Conditions } from './conditions';

export type BaseDbScreen = {
    id: number;
    type: string;
    options: any;
    conditions: Conditions | null;
    visibleFrom: Date | null;
    visibleUntil: Date | null;
    duration: number;
}

export type BaseScreenAvailable = {
    available: true;
    id: number;
    subId: number;
    type: string;
    options: Record<string, any>;
    duration: number;
}

export type ScreenUnavailable = {
    available: false;
}