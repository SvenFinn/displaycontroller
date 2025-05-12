import { logger } from "dc-logger";
import { updateOverrides } from "./overrides";
import { updateShooters } from "./shooter";
import { LocalClient } from "dc-db-local";
import dotenv from "dotenv";
dotenv.config();

const localClient = new LocalClient();

if (!process.env.CACHE_REFRESH_INTERVAL) {
    logger.error("CACHE_REFRESH_INTERVAL is not set");
    process.exit(1);
}
const refreshInterval = parseInt(process.env.CACHE_REFRESH_INTERVAL);

async function updateCaches() {
    logger.info("Updating caches");
    await Promise.all([
        updateOverrides(localClient),
        updateShooters(localClient),
    ]);
    setTimeout(updateCaches, refreshInterval);
}

updateCaches();
