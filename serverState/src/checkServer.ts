import { execSync } from "child_process";
import { LocalClient } from "dc-db-local";
import { AdvServerState } from "./types";
import { logger } from "dc-logger";
import semver from "semver";
import dotenv from "dotenv";
import { createSMDBClient } from "dc-db-smdb";
dotenv.config();

const prismaClient = new LocalClient();

export async function checkServiceAvailability(): Promise<AdvServerState | null> {
    logger.debug("Fetching server information");
    const server = (await prismaClient.parameter.findUnique({
        where: {
            key: "MEYTON_SERVER_IP"
        }
    }))?.strValue;
    if (!server) {
        return {
            online: false
        };
    }
    if (!process.env.MEYTON_SSH_USER || !process.env.MEYTON_SSH_PASS) {
        logger.info(process.env);
        logger.error("MEYTON_SSH_USER or MEYTON_SSH_PASS not set");
        return {
            online: false
        };
    }
    const commands = 'echo -n "Version=" && sed -n "s/^Version=//p" /etc/meyton/shootmaster.version && ' +
        'echo -n "Services=" && sed -n "s/^RealServerDaemons=//p" /etc/meyton/shootmasterd.cfg';
    let output = "";
    try {
        output = execSync(`sshpass -p "${process.env.MEYTON_SSH_PASS}" ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${process.env.MEYTON_SSH_USER}@${server} '${commands}'`, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
    } catch (e) {
        logger.error(`Error while checking server availability: ${e}`);
        return null;
    }
    const outLines = output.split("\n");
    const serverState: AdvServerState = {
        online: true,
        version: "",
        compatible: false,
        services: {
            ssmdb2: false,
            smdb: false
        }
    };
    for (let i = 0; i < outLines.length; i++) {
        const line = outLines[i].trim();
        if (line.length == 0) {
            continue;
        }
        const key = line.split("=")[0];
        const value = line.split("=").slice(1).join("=");
        if (key == "Version") {
            serverState.version = value;
        } else if (key == "Services") {
            serverState.services.ssmdb2 = value.match("targetd_ssmdb2") != null;
        }
    }
    serverState.services.smdb = await checkDatabaseAvailability();
    serverState.compatible = checkServerCompatibility(serverState);
    return serverState;
}

export async function checkServerAvailable(): Promise<boolean> {
    logger.debug("Checking server availability");
    const server = (await prismaClient.parameter.findUnique({
        where: {
            key: "MEYTON_SERVER_IP"
        }
    }))?.strValue;
    if (!server) {
        return false;
    }
    try {
        execSync("nc -zw 1 " + server + " 22", { encoding: "utf-8", stdio: ["ignore", "ignore", "ignore"] });
        return true
    } catch (e) {
        return false
    }
}

function checkServerCompatibility(serverState: AdvServerState): boolean {
    if (!serverState.online) {
        logger.error("Server is offline");
        return false;
    }
    if (!serverState.services.smdb) {
        logger.warn("SMDB service is not available");
        return false;
    }
    if (!process.env.MAX_MEYTON_VERSION || !process.env.MIN_MEYTON_VERSION) {
        logger.error("Environment variables MAX_MEYTON_VERSION and MIN_MEYTON_VERSION must be set");
        return false;
    }
    const minVersion = semver.coerce(process.env.MIN_MEYTON_VERSION);
    const maxVersion = semver.coerce(process.env.MAX_MEYTON_VERSION);
    if (!minVersion || !maxVersion) {
        logger.error("Environment variables MAX_MEYTON_VERSION and MIN_MEYTON_VERSION must be in the correct format");
        return false;
    }
    // Check if the version is in the format X.Y.Z
    const versionSemver = semver.coerce(serverState.version);
    if (!versionSemver) {
        logger.error("Version is not in the correct format");
        return false;
    }
    if (semver.lte(versionSemver, maxVersion) && semver.gte(versionSemver, minVersion)) {
        logger.debug("Meyton server version is compatible");
        return true;
    }
    logger.warn("Meyton server version is not compatible");
    return false;
}

async function checkDatabaseAvailability(): Promise<boolean> {
    const client = await createSMDBClient(prismaClient);
    try {
        await client.$connect();
        await client.$disconnect();
        return true;
    }
    catch (e) {
        logger.error("Error while checking database availability: " + e);
        return false;
    }
}