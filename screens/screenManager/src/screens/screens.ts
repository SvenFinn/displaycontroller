import { LocalClient } from "dc-db-local";
import { resolveScreen } from "./types";
import { isDbScreen, DbScreen, Screen } from "dc-screens-types";
import { checkCondition } from "./conditions";
import { logger } from "dc-logger";

export async function loadNextScreen(localClient: LocalClient, currentScreenId: number): Promise<Array<Screen>> {
    let loopOne = true;
    while (true) {
        let nextScreen = await localClient.screens.findFirst({
            where: {
                id: {
                    gt: currentScreenId
                }
            },
            orderBy: {
                id: "asc"
            }
        });
        if (!nextScreen) {
            if (!loopOne) {
                return [{
                    available: false
                }]; // We have looped through all screens and found no new screen
            }
            loopOne = false;
            currentScreenId = 0;
            continue
        }
        if (!isDbScreen(nextScreen)) {
            logger.warn("Failed type check")
            // @ts-expect-error The invalid screen is not in the original type returned by the database, so we need to cast it
            nextScreen = {
                id: nextScreen.id,

                type: "systemMessage",
                options: {
                    type: "invalidScreen",
                    id: nextScreen.id,
                    screenType: nextScreen.type,
                },
                condition: null,
                visibleFrom: null,
                visibleUntil: null,
                duration: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as DbScreen;
        }
        const nextDbScreen = nextScreen as DbScreen;
        logger.info(`Found screen with id ${nextDbScreen.id} for old screen id ${currentScreenId}`);
        const nextScreenId = nextDbScreen.id;
        currentScreenId = nextScreenId; // Update currentScreenId for next iteration
        if (! await checkCondition(localClient, nextDbScreen)) {
            continue;
        }
        const parsedScreen = await resolveScreen(nextDbScreen) || [];
        if (parsedScreen.length > 0) {
            return parsedScreen;
        }
    }
}