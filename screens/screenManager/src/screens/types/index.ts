import { DbScreen, Screen } from "dc-screens-types";
import cpcView from "./cpcView";
import drawTarget from "./drawTarget";
import evaluation from "./evaluation";
import imageViewer from "./imageViewer";
import { logger } from "dc-logger";
import systemMessage from "./systemMessage";
import customURL from "./customURL";

export async function resolveScreen(screen: DbScreen): Promise<Array<Screen> | undefined> {
    switch (screen.type) {
        case "evaluation":
            return await evaluation(screen);
        case "cpcView":
            return await cpcView(screen);
        case "imageViewer":
            return await imageViewer(screen);
        case "drawTarget":
            return await drawTarget(screen);
        case "systemMessage":
            return await systemMessage(screen);
        case "customURL":
            return await customURL(screen);
        default:
            const screenWType = screen as any;
            logger.warn(`Screen ${screenWType?.id || "unknown"} has an unknown type ${screenWType?.type || "unknown"}`);
            return undefined;
    }
}

export type Screens = Screen[];
