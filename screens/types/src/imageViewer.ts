import { createIs } from "typia";
import { BaseDbScreen, BaseScreenAvailable } from "./base";

export type ViewerDbScreen = BaseDbScreen & {
    preset: "imageViewer";
    options: ViewerOptions;
}

export type ViewerScreen = BaseScreenAvailable & {
    preset: "imageViewer";
    options: ViewerOptions;
}

export type ViewerOptions = {
    path: string;
}

export const isViewerOptions = createIs<ViewerOptions>();
