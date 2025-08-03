import { AdvServerState } from "./types";
import { logger } from "dc-logger";
import { Screen } from "dc-screens-types";
import amqp from "amqplib";

const MAX_DB_NUM = 2147483647;

let sendInterval: NodeJS.Timeout | undefined;

export async function sendSystemScreen(serverState: AdvServerState, channel: amqp.Channel) {
    if (sendInterval) {
        clearInterval(sendInterval);
        sendInterval = undefined;
    }
    if (!serverState.online) return;
    if (!serverState.services.smdb) {
        logger.info("SMDB not available");
        const screen: Screen = {
            available: true,
            type: "systemMessage",
            options: {
                type: "SMDBAccess"
            },
            duration: 30000,
            id: MAX_DB_NUM,
            subId: 0
        };
        sendInterval = setInterval(sendSystemScreenInternal, 5000, screen, channel);
        return;
    }
    if (!serverState.compatible) {
        const screen: Screen = {
            available: true,
            type: "systemMessage",
            options: {
                type: "serverIncompatible",
                serverVersion: serverState.version
            },
            duration: 10000,
            id: MAX_DB_NUM,
            subId: 0
        };
        sendInterval = setInterval(sendSystemScreenInternal, 5000, screen, channel);
        return;
    }
    if (!serverState.services.ssmdb2) {
        logger.info("SSMDB2 not available");
        const screen: Screen = {
            available: true,
            type: "systemMessage",
            options: {
                type: "ssmdb2"
            },
            duration: 30000,
            id: MAX_DB_NUM,
            subId: 0
        };
        sendSystemScreenInternal(screen, channel);
        return;
    }
    if (serverState.online && serverState.compatible) {
        return;
    }
}

async function sendSystemScreenInternal(screen: Screen, channel: amqp.Channel) {
    logger.info("Sending screen");
    await channel.sendToQueue("screens.systemScreens", Buffer.from(JSON.stringify(screen)));
}