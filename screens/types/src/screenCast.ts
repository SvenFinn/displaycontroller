import { BaseDbScreen, BaseScreenAvailable } from './base.js';

export type ScreenCastScreen = BaseScreenAvailable & {
    type: "screenCast";
    options: {};
};

export type ScreenCastDbScreen = BaseDbScreen & {
    type: "screenCast";
    options: {};
};