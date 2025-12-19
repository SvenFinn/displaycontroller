import { tags } from 'typia';
import { Conditions } from './conditions/index.js';
import { DateString, ScreenId } from './common.js';


export type BaseDbScreen = {
    id: ScreenId;
    type: string;
    options: Record<string, any>;
    conditions: Conditions | null;
    visibleFrom: DateString | null;
    visibleUntil: DateString | null;
    duration: number & tags.Minimum<1>;
}

export type BaseScreenAvailable = {
    available: true;
    id: ScreenId;
    subId: number;
    type: string;
    options: Record<string, any>;
    duration: number & tags.Minimum<1>;
}

export type ScreenUnavailable = {
    available: false;
    duration: 10000;
}