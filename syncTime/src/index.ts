import { execSync } from "child_process"
import { LocalClient } from "dc-db-local";
import { createSMDBClient } from "dc-db-smdb";
import { CurrentTimestamp } from "./types";
import { logger } from "dc-logger";
import { io } from "socket.io-client";

const localClient = new LocalClient();
const socket = io("http://server-state:80/api/serverState", { path: "/api/serverState/ws", transports: ["websocket", "polling"] });

let syncTimeout: NodeJS.Timeout | null = null;

socket.on("connect", () => {
    logger.info("Connected to server state via socket.io");
});
socket.on("data", async (data: boolean) => {
    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }
    if (data) {
        loop();
    }
});

async function loop() {
    const syncEnabled = (await localClient.parameter.findUnique({
        where: {
            key: "ENABLE_TIME_SYNC"
        }
    }))?.boolValue;
    if (!syncEnabled) {
        return;
    }
    logger.info("Syncing time");
    const smdbClient = await createSMDBClient(localClient);
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
    const syncInterval = (await localClient.parameter.findUnique({
        where: {
            key: "TIME_SYNC_INTERVAL"
        }
    }))?.numValue;

    syncTimeout = setTimeout(loop, syncInterval || 60000);
    smdbClient.$disconnect();
}
