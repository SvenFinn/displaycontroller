import { BaseDbScreen, BaseScreenAvailable } from './base';

export type ScreenCastScreen = BaseScreenAvailable & {
    preset: "screenCast";
    options: {};
};

export type ScreenCastDbScreen = BaseDbScreen & {
    preset: "screenCast";
    options: {};
};