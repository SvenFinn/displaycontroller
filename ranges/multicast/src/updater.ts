import { updateDisciplines } from "./discipline";
import { updateStartList } from "./startList";
import { updateShooters } from "./shooter";
import { LocalClient } from "dc-db-local";
import { logger } from "dc-logger";
import { updateOverrides } from "./discipline/overrides";
import dotenv from "dotenv";
dotenv.config();

const client = new LocalClient();

if (!process.env.CACHE_REFRESH_INTERVAL) {
    logger.error("CACHE_REFRESH_INTERVAL is not set");
    process.exit(1);
}
const refreshInterval = parseInt(process.env.CACHE_REFRESH_INTERVAL);

async function update() {
    logger.info("Updating caches");
    await Promise.all([
        updateDisciplines(client),
        updateOverrides(client),
        updateStartList(client),
        updateShooters(client)
    ]);
    setTimeout(update, refreshInterval);
}

update();