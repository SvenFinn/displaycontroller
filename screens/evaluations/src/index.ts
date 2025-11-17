import { LocalClient } from "dc-db-local";
import { sync } from "./sync";
import "./server";
import { logger } from "dc-logger";
import fs from "fs";
import os from "os";
import path from "path";
import dotenv from "dotenv";
import { io, Socket } from "socket.io-client";

dotenv.config({ quiet: true });

const htmlPath = process.env.EVALUATIONS_VOLUME_PATH || "/app/evaluations";
// create temp directories inside the OS temp dir with a prefix
const smbPath = fs.mkdtempSync(path.join(os.tmpdir(), "evaluations-smb-"));
const convPath = fs.mkdtempSync(path.join(os.tmpdir(), "evaluations-conv-"));

if (!fs.existsSync(htmlPath)) {
    fs.mkdirSync(htmlPath, { recursive: true });
}

const localClient = new LocalClient();
const socket = io("http://server-state:80/api/serverState", { path: "/api/serverState/ws", transports: ["websocket", "polling"] });

let nextSyncTimeOut: NodeJS.Timeout | null = null;
let serverState: boolean = false;

// Robust scheduler implementation (single concurrency)
let isSyncing = false;

async function getServerIp(): Promise<string | null> {
    return (await localClient.parameter.findUnique({
        where: { key: "SM_SERVER_IP" }
    }))?.strValue ?? null;
}

async function getIntervalMs(): Promise<number> {
    const syncInterval = (await localClient.parameter.findUnique({
        where: { key: "EVALUATION_SYNC_INTERVAL" }
    }))?.numValue;
    if (typeof syncInterval === 'number' && syncInterval > 0) {
        // If value looks small (<1000) we assume seconds stored in DB; convert to ms.
        return syncInterval < 1000 ? syncInterval * 1000 : syncInterval;
    }
    // fallback default 60s
    return 60000;
}

function clearScheduled() {
    if (nextSyncTimeOut) {
        clearTimeout(nextSyncTimeOut);
        nextSyncTimeOut = null;
    }
}

function scheduleNext(ms: number) {
    clearScheduled();
    nextSyncTimeOut = setTimeout(() => void runOnce(), ms);
}

async function attemptSync(server: string): Promise<boolean> {
    try {
        isSyncing = true;
        logger.info(`Syncing evaluations with server ${server}`);
        await sync(server, smbPath, convPath, htmlPath);
        logger.info("Evaluation sync completed successfully");
        return true;
    } catch (err) {
        logger.error(`Error during evaluation sync: ${String(err)}`);
        return false;
    } finally {
        isSyncing = false;
    }
}

async function runOnce() {
    const syncEnabled = (await localClient.parameter.findUnique({
        where: {
            key: "ENABLE_EVALUATION_SYNC"
        }
    }))?.boolValue;
    if (!syncEnabled) {
        return;
    }

    if (!serverState) {
        // nothing to do
        return;
    }
    if (isSyncing) {
        logger.info("Sync already in progress — skipping this run");
        // schedule a short follow-up
        scheduleNext(5000);
        return;
    }

    const server = await getServerIp();
    if (!server) {
        logger.warn("SM_SERVER_IP not configured — will retry later");
        // try again later with default interval
        const interval = await getIntervalMs();
        scheduleNext(interval);
        return;
    }

    const success = await attemptSync(server);
    // Always schedule next run according to configured interval while serverState is true.
    const interval = await getIntervalMs();
    logger.info(`Scheduling next sync in ${interval}ms (last success: ${success})`);
    scheduleNext(interval);
}

socket.on("connect", () => {
    logger.info("Connected to server state via socket.io");
});
socket.on("disconnect", (reason) => {
    logger.info(`Disconnected from server state: ${reason}`);
    serverState = false;
    if (nextSyncTimeOut) { clearTimeout(nextSyncTimeOut); nextSyncTimeOut = null; }
});
socket.on("serverState", async (data: boolean) => {
    const s = Boolean(data);
    logger.info("Received server state via socket.io: " + String(s));
    serverState = s;
    if (serverState) {
        // trigger immediate sync run
        void runOnce();
    } else {
        // stop any scheduled runs
        clearScheduled();
    }
});
