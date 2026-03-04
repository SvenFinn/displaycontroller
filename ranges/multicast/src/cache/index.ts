import { createLocalClient } from "dc-db-local";
import { logger } from "dc-logger";
import dotenv from "dotenv";
import { updatePotentialDisciplines } from "./disciplines";
import { updatePotentialShooters } from "./shooters";
import { updatePotentialStartLists } from "./startlists";
dotenv.config({ quiet: true });

const client = createLocalClient();

if (!process.env.CACHE_REFRESH_INTERVAL) {
    logger.error("CACHE_REFRESH_INTERVAL is not set");
    process.exit(1);
}
const refreshInterval = parseInt(process.env.CACHE_REFRESH_INTERVAL);

async function update() {
    logger.info("Updating caches");
    await Promise.all([
        updatePotentialDisciplines(client),
        updatePotentialShooters(client),
        updatePotentialStartLists(client),
    ]);
    setTimeout(update, refreshInterval);
}

update();