import { DbScreen, Screen } from "@shared/screens";
import cpcView from "./cpcView";
import drawTarget from "./drawTarget";
import evaluation from "./evaluation";
import evaluationGallery from "./evaluationGallery";
import imageViewer from "./imageViewer";
import { logger } from "dc-logger";
import systemMessage from "./systemMessage";

export async function resolvePreset(screen: DbScreen): Promise<Array<Screen> | undefined> {
    switch (screen.preset) {
        case "evaluation":
            return await evaluation(screen);
        case "cpcView":
            return await cpcView(screen);
        case "imageViewer":
            return await imageViewer(screen);
        case "evaluationGallery":
            return await evaluationGallery(screen);
        case "drawTarget":
            return await drawTarget(screen);
        case "systemMessage":
            return await systemMessage(screen);
        default:
            const screenWType = screen as any;
            logger.warn(`Screen ${screenWType?.id || "unknown"} has an unknown preset ${screenWType?.preset || "unknown"}`);
            return undefined;
    }
}

export type Screens = Screen[];
