import { LocalClient } from "dc-db-local";
import { updateDisciplines, updateOverrides } from "./disciplines";
import { updateShooters } from "./shooters";
import { updateStartLists } from "./startLists";
import { logger } from "dc-logger";
import dotenv from "dotenv";
import { updateIpAddresses } from "./ipAddress";
dotenv.config();

const client = new LocalClient();

if (!process.env.CACHE_REFRESH_INTERVAL) {
    logger.error("CACHE_REFRESH_INTERVAL is not set");
    process.exit(1);
}

const refreshInterval = parseInt(process.env.CACHE_REFRESH_INTERVAL);

async function update() {
    logger.info("Updating cache")
    await Promise.all([
        updateDisciplines(client),
        updateOverrides(client),
        updateShooters(client),
        updateStartLists(client),
        updateIpAddresses(client)
    ]);
    setTimeout(update, refreshInterval);
}

update();