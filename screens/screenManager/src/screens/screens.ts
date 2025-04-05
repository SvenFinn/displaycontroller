import { LocalClient } from "dc-db-local";
import { resolvePreset } from "./presets";
import { isDbScreen, DbScreen } from "@shared/screens";
import { Screen } from "@shared/screens";
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
            //@ts-ignore
            nextScreen = {
                id: nextScreen.id,

                preset: "systemMessage",
                options: {
                    type: "invalidScreen",
                    id: nextScreen.id,
                    preset: nextScreen.preset,
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
        const parsedScreen = await resolvePreset(nextDbScreen) || [];
        if (parsedScreen.length > 0) {
            return parsedScreen;
        }
    }
}