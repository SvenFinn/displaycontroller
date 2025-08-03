import { createIs } from "typia";
import { BaseDbScreen, BaseScreenAvailable } from "./base";

export type ViewerDbScreen = BaseDbScreen & {
    type: "imageViewer";
    options: ViewerOptions;
}

export type ViewerScreen = BaseScreenAvailable & {
    type: "imageViewer";
    options: ViewerOptions;
}

export type ViewerOptions = {
    path: string;
}

export const isViewerOptions = createIs<ViewerOptions>();
