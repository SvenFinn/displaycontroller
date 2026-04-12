import { DbScreen, Screen } from "dc-screens-types";
import cpcView from "./cpcView";
import drawTarget from "./drawTarget";
import evaluation from "./evaluation";
import imageViewer from "./imageViewer";
import { logger } from "dc-logger";
import embed from "./embed";

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
        case "embed":
            return await embed(screen);
        default:
            const exhaustiveCheck: never = screen;
            // @ts-ignore - This is to satisfy the exhaustive check, it should never be reached
            logger.warn(`Screen ${screen?.id} has an unknown type ${screen?.type}`);
            return undefined;
    }
}

export type Screens = Screen[];
