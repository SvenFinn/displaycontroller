import { Condition } from './conditions';

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

export type BaseScreenAvailable = {
    available: true;
    id: number;
    subId: number;
    preset: string;
    options: Record<string, any>;
    duration: number;
}

export type ScreenUnavailable = {
    available: false;
}