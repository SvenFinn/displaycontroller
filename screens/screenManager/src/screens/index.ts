import { LocalClient } from "dc-db-local";
import { isDbScreen, isScreen, Screen } from "@shared/screens";
import { logger } from "dc-logger";
import { sendSSEResponse } from "../server";
import { loadNextScreen } from "./screens";
import amqp from "amqplib"
import { resolvePreset } from "./presets";

const localClient: LocalClient = new LocalClient();

let currentScreen: Screen = { available: false };
let nextScreenList: Array<Screen> = [];
const previousScreenList: Array<Screen> = [];
let screenTimeout: NodeJS.Timeout | undefined = undefined;
let isPaused: boolean = false;

enum Direction {
    Next = 0,
    Previous = 1
}

export function nextScreen() {
    if (screenTimeout) {
        clearTimeout(screenTimeout);
        screenTimeout = undefined;
    }
    screenLoop();
}

export function previousScreen() {
    if (previousScreenList.length < 1) {
        logger.warn("No previous screen to go back to");
        return;
    }
    screenLoop(Direction.Previous);
}

export function getPaused() {
    return isPaused;
}

export function pauseScreen() {
    if (screenTimeout) {
        clearTimeout(screenTimeout);
        screenTimeout = undefined;
        isPaused = true;
    } else {
        isPaused = false;
        screenLoop();
    }
}

export function getCurrentScreen() {
    return currentScreen;
}

export async function gotoScreen(id: number, subId: number = 0) {
    if (screenTimeout) {
        clearTimeout(screenTimeout);
        screenTimeout = undefined;
    }
    const nextScreen = await localClient.screens.findFirst({
        where: {
            id: id
        }
    });
    if (!nextScreen) {
        logger.warn(`Screen ${id} not found`);
        return
    }
    if (!isDbScreen(nextScreen)) {
        logger.warn(`Screen ${id} is not a valid screen`);
        return
    }
    nextScreenList = await resolvePreset(nextScreen) || [];
    if (nextScreenList.length <= subId) {
        subId = 0;
    }
    nextScreenList = nextScreenList.slice(subId);
    screenLoop();
}

async function screenLoop(direction: Direction = Direction.Next) {
    if (screenTimeout) {
        clearTimeout(screenTimeout);
        screenTimeout = undefined;
    }
    if (direction === Direction.Previous) {
        nextScreenList.unshift(previousScreenList.pop() || { available: false });
    } else {
        const previousScreen = nextScreenList.shift();
        if (previousScreen) {
            previousScreenList.push(previousScreen);
        }
        if (nextScreenList.length < 1) {
            nextScreenList = await loadNextScreen(localClient, currentScreen.available ? currentScreen.id : 0);
        }
    }
    currentScreen = nextScreenList[0] || { available: false };
    while (previousScreenList.length > 20) {
        previousScreenList.shift();
    }
    sendSSEResponse(currentScreen);
    if (!currentScreen.available) {
        logger.info('No available screens, waiting 10s');
        if (!isPaused) {
            screenTimeout = setTimeout(screenLoop, 10000);
        }
        return;
    } else {
        logger.info(`Current screen: ${currentScreen.id}-${currentScreen.subId}`);
        if (!isPaused) {
            screenTimeout = setTimeout(screenLoop, currentScreen.duration);
        }
        return;
    }
}

async function main() {
    const connection = await amqp.connect("amqp://rabbitmq");
    const channel = await connection.createChannel();
    await channel.assertQueue("screens.systemScreens", {
        durable: false,
        autoDelete: true,
        messageTtl: 30000
    });
    await channel.prefetch(1);
    await channel.consume("screens.systemScreens", async (msg) => {
        if (msg === null) {
            return;
        }
        const message = JSON.parse(msg.content.toString());
        if (!isScreen(message)) {
            return;
        }
        const screen = message as Screen;
        nextScreenList = [screen];
        screenLoop();
        setTimeout(() => {
            channel.ack(msg);
        }, 5000);
    });
    logger.info("Screen manager started");
    screenLoop();
}

main();