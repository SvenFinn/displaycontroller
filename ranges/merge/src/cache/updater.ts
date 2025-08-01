import { LocalClient } from "dc-db-local";
import { updateDisciplines, updateOverrides } from "./disciplines";
import { updateShooters } from "./shooters";
import { updateStartLists } from "./startLists";
import { logger } from "dc-logger";

const client = new LocalClient();

async function update() {
    logger.info("Updating cache")
    await Promise.all([
        updateDisciplines(client),
        updateOverrides(client),
        updateShooters(client),
        updateStartLists(client),
    ]);
    setTimeout(update, 60000);
}

update();