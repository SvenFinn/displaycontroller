import { updateDisciplines } from "./disciplines";
import { LocalClient } from "dc-db-local";
import { logger } from "dc-logger";

const localClient = new LocalClient();

async function updateCaches() {
    logger.info("Updating caches");
    await updateDisciplines(localClient);
    setTimeout(updateCaches, 60000);
}

updateCaches();