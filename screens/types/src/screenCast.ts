import { BaseScreenAvailable } from './base.js';

export type ScreenCastScreen = BaseScreenAvailable & {
    type: "screenCast";
    options: {};
};