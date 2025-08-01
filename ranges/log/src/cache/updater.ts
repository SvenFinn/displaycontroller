import { logger } from "dc-logger";
import { updateOverrides } from "./overrides";
import { updateShooters } from "./shooter";
import { LocalClient } from "dc-db-local";

const localClient = new LocalClient();

async function updateCaches() {
    logger.info("Updating caches");
    await Promise.all([
        updateOverrides(localClient),
        updateShooters(localClient),
    ]);
    setTimeout(updateCaches, 60000);
}

updateCaches();
