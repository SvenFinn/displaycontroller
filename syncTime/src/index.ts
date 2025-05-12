import { execSync } from "child_process"
import { EventSource } from "eventsource";
import { LocalClient } from "dc-db-local";
import { createSMDBClient } from "dc-db-smdb";
import { CurrentTimestamp } from "./types";
import { logger } from "dc-logger";

let localPrismaClient: LocalClient = new LocalClient();

let syncTimeout: NodeJS.Timeout | null = null;

async function main() {
    const syncEnabled = (await localPrismaClient.parameter.findUnique({
        where: {
            key: "ENABLE_TIME_SYNC"
        }
    }))?.boolValue;
    if (!syncEnabled) {
        logger.info("Time sync is disabled")
        return;
    }
    const eventSource = new EventSource("http://server-state:80/api/serverState/sse");
    eventSource.onopen = () => {
        logger.info("Connected to server state events")
    }
    eventSource.onmessage = async (event) => {
        if (syncTimeout) {
            clearTimeout(syncTimeout);
        }
        const serverState = JSON.parse(event.data);
        if (serverState) {
            loop();
        }
    }
}

async function loop() {
    logger.info("Syncing time");
    const smdbClient = await createSMDBClient(localPrismaClient);
    let timestampQuery: CurrentTimestamp[] = [];
    try {
        timestampQuery = (await smdbClient.$queryRaw`SELECT UTC_TIMESTAMP;`) as CurrentTimestamp[];
    } catch (e) {
        logger.error(e);
    }
    if (timestampQuery.length > 0) {
        logger.info(`Setting time to ${timestampQuery[0].UTC_TIMESTAMP}`);
        const date = timestampQuery[0].UTC_TIMESTAMP;
        execSync(`date -s @${Math.round(date.getTime() / 1000)}`);
    }
    const syncInterval = (await localPrismaClient.parameter.findUnique({
        where: {
            key: "TIME_SYNC_INTERVAL"
        }
    }))?.numValue;

    syncTimeout = setTimeout(loop, syncInterval || 60000);
    smdbClient.$disconnect();
}

main();
