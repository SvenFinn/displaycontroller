import { fetchSamba } from './smb';
import { promises as fs } from 'fs';
import { rewriteHTML } from '../rewrite';
import { createLocalClient } from 'dc-db-local';
import { io } from 'socket.io-client';
import { logger } from 'dc-logger';
import { htmlPath } from '../constants';
import path from 'path';

const localClient = createLocalClient();
const serverState = io("http://server-state:80/api/serverState", { path: "/api/serverState/ws" });

let interval: NodeJS.Timeout | null = null;

serverState.on("connect", () => {
    logger.info("Connected to server state via socket.io");
});
serverState.on("disconnect", (reason) => {
    logger.info(`Disconnected from server state: ${reason}`);
    if (interval) { clearInterval(interval); interval = null; }
});
serverState.on("data", async (data: boolean) => {
    const serverState = Boolean(data);
    logger.info("Received server state via socket.io: " + String(serverState));
    const intervalMs = await localClient.parameter.findUnique({
        where: { key: "EVALUATION_SYNC_INTERVAL" }
    });
    if (!intervalMs?.numValue) {
        logger.warn("EVALUATION_SYNC_INTERVAL not set, using default 60000ms");
    }
    if (serverState && !interval) {
        await sync(htmlPath);
        interval = setInterval(async () => {
            await sync(htmlPath);
        }, intervalMs?.numValue || 60000);
    }
});

export async function sync(targetPath: string): Promise<void> {
    const serverIp = await localClient.parameter.findUnique({
        where: { key: "SM_SERVER_IP" }
    });
    if (!serverIp?.strValue) {
        throw new Error("SM_SERVER_IP not configured");
    }
    try {
        await using smbDir = await fs.mkdtempDisposable("evaluations-smb-");
        await using convDir = await fs.mkdtempDisposable("evaluations-conv-");
        await fetchSamba(serverIp.strValue, smbDir.path);
        await rewriteHTML(smbDir.path, convDir.path);
        await clearDirectory(targetPath);
        await fs.mkdir(targetPath, { recursive: true });
        await fs.cp(convDir.path, targetPath, { recursive: true });
    } catch (err) {
        logger.error(`Sync failed: ${err}`);
    }
}

async function clearDirectory(dir: string) {
    const entries = await fs.readdir(dir);
    await Promise.all(
        entries.map(entry =>
            fs.rm(path.join(dir, entry), { recursive: true, force: true })
        )
    );
}