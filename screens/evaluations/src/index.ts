import { LocalClient } from "dc-db-local";
import { EventSource } from 'eventsource';
import { sync } from "./sync";
import "./server";
import { logger } from "dc-logger";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const htmlPath = process.env.EVALUATIONS_VOLUME_PATH || "/app/evaluations";
const smbPath = fs.mkdtempSync("html")
const convPath = fs.mkdtempSync("conv")
if (!fs.existsSync(htmlPath)) {
    fs.mkdirSync(htmlPath, { recursive: true });
}

process.addListener("beforeExit", () => {
    convPath && fs.rmdirSync(convPath, { recursive: true });
    smbPath && fs.rmdirSync(smbPath, { recursive: true });
});


const localClient = new LocalClient();
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
        const server = (await localClient.parameter.findUnique({
            where: {
                key: "MEYTON_SERVER_IP"
            }
        }))?.strValue;
        if (server) {
            await sync(server, smbPath, convPath, htmlPath);
        }
        const syncInterval = (await localClient.parameter.findUnique({
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
    const syncEnabled = (await localClient.parameter.findUnique({
        where: {
            key: "ENABLE_EVALUATION_SYNC"
        }
    }))?.boolValue;
    if (!syncEnabled) {
        logger.info("Evaluation sync is disabled");
        return;
    }
    const serverStateEvents = new EventSource("http://server-state:80/api/serverState/sse");
    serverStateEvents.onmessage = loop;
    serverStateEvents.onopen = () => {
        logger.info("Connected to server state events");
    }
}

main();
