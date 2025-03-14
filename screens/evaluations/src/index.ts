import { LocalClient, createLocalClient } from "dc-db-local";
import { EventSource } from 'eventsource';
import { sync } from "./sync";
import path from "path";
import { startServer } from "./server";
import { logger } from "dc-logger";
import fs from "fs";

const htmlPath = path.resolve(`${__dirname}/../evaluations`);
const smbPath = fs.mkdtempSync("html")
const convPath = fs.mkdtempSync("conv")
if (!fs.existsSync(htmlPath)) {
    fs.mkdirSync(htmlPath, { recursive: true });
}

process.addListener("beforeExit", () => {
    convPath && fs.rmdirSync(convPath, { recursive: true });
    smbPath && fs.rmdirSync(smbPath, { recursive: true });
});


let localPrismaClient: LocalClient | null = null;
let nextSyncTimeOut: NodeJS.Timeout | null = null;
let serverState: boolean = false;

async function loop(event: MessageEvent | null = null) {
    if (event) {
        const curState = JSON.parse(event.data);
        serverState = curState;
    }
    if (serverState) {
        if (nextSyncTimeOut) {
            clearTimeout(nextSyncTimeOut);
        }
        if (!localPrismaClient) {
            localPrismaClient = await createLocalClient();
        }
        const server = (await localPrismaClient.parameter.findUnique({
            where: {
                key: "MEYTON_SERVER_IP"
            }
        }))?.strValue;
        if (server) {
            await sync(server, smbPath, convPath, htmlPath);
        }
        const syncInterval = (await localPrismaClient.parameter.findUnique({
            where: {
                key: "EVALUATION_SYNC_INTERVAL"
            }
        }))?.numValue;
        if (!syncInterval) {
            nextSyncTimeOut = setTimeout(loop, 60000);
        } else {
            nextSyncTimeOut = setTimeout(loop, syncInterval);
        }
    }
}

async function main() {
    localPrismaClient = await createLocalClient();
    const syncEnabled = (await localPrismaClient.parameter.findUnique({
        where: {
            key: "ENABLE_EVALUATION_SYNC"
        }
    }))?.boolValue;
    if (!syncEnabled) {
        logger.info("Evaluation sync is disabled");
        return;
    }
    startServer(htmlPath);
    const serverStateEvents = new EventSource("http://check-server:80/api/serverState/sse");
    serverStateEvents.onmessage = loop;
    serverStateEvents.onopen = () => {
        logger.info("Connected to server state events");
    }
}

main();
