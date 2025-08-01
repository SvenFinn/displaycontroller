import { LocalClient } from "dc-db-local";
import { logger } from "dc-logger";
import { isDbScreen, isScreen, Screen, ScreenAvailable } from "dc-screens-types";
import { EventEmitter } from "node:stream";
import { resolvePreset } from "./presets";
import { loadNextScreen } from "./screens";

enum Direction {
    Next = 0,
    Previous = 1
}

const MAX_PREVIOUS_SCREENS = 20;
const EMPTY_SCREEN: Screen = { available: false };

class ScreenManager extends EventEmitter {
    private currentScreen: Screen = EMPTY_SCREEN;
    private nextScreenList: Screen[] = [];
    private previousScreenList: Screen[] = [];
    private screenTimeout?: NodeJS.Timeout;
    private isPaused: boolean = false;
    private inTemporaryMode: boolean = false;

    constructor(private localClient: LocalClient) {
        super();
    }

    public getCurrentScreen() {
        return this.currentScreen;
    }

    public getPaused() {
        return this.isPaused;
    }

    public nextScreen() {
        this.clearTimeout();
        this.screenLoop();
    }

    public previousScreen() {
        if (this.previousScreenList.length < 1) {
            logger.warn("No previous screen to go back to");
            return;
        }
        this.screenLoop(Direction.Previous);
    }

    public pauseScreen() {
        if (this.screenTimeout) {
            this.clearTimeout();
            this.isPaused = true;
        } else {
            this.isPaused = false;
            this.screenLoop();
        }
    }

    public async gotoScreen(id: number, subId: number = 0) {
        this.clearTimeout();

        const nextScreen = await this.localClient.screens.findFirst({ where: { id } });

        if (!nextScreen || !isDbScreen(nextScreen)) {
            logger.warn(`Invalid screen ${id}`);
            return;
        }

        const presetScreens = await resolvePreset(nextScreen) || [];
        if (presetScreens.length <= subId) subId = 0;

        this.nextScreenList = presetScreens.slice(subId);
        this.inTemporaryMode = false;
        this.screenLoop();
    }

    public showScreenTemporarily(screen: ScreenAvailable) {
        this.clearTimeout();

        if (!isScreen(screen)) {
            logger.warn("Attempted to show an invalid screen");
            return;
        }

        this.inTemporaryMode = true;
        this.currentScreen = screen;
        this.emit("screenChanged", screen);

        logger.info(`Temporarily showing screen: ${screen.id}-${screen.subId}`);

        if (this.currentScreen.available && !this.isPaused) {
            this.setTimeout(() => {
                this.inTemporaryMode = false;
                this.screenLoop(); // resume normal flow
            }, this.currentScreen.duration);
        }
    }

    private async screenLoop(direction: Direction = Direction.Next) {
        this.clearTimeout();

        if (this.inTemporaryMode) return;

        if (direction === Direction.Previous) {
            this.nextScreenList.unshift(this.previousScreenList.pop() || EMPTY_SCREEN);
        } else {
            const prev = this.nextScreenList.shift();
            if (prev) this.previousScreenList.push(prev);

            if (this.nextScreenList.length < 1) {
                this.nextScreenList = await loadNextScreen(
                    this.localClient,
                    this.currentScreen.available ? this.currentScreen.id : 0
                );
            }
        }

        this.currentScreen = this.nextScreenList.shift() || EMPTY_SCREEN;

        while (this.previousScreenList.length > MAX_PREVIOUS_SCREENS) {
            this.previousScreenList.shift();
        }

        this.emit("screenChanged", this.currentScreen);

        if (!this.currentScreen.available) {
            logger.info("No available screens, waiting 10s");
            if (!this.isPaused) {
                this.setTimeout(() => this.screenLoop(), 10000);
            }
        } else {
            logger.info(`Current screen: ${this.currentScreen.id}-${this.currentScreen.subId}`);
            if (!this.isPaused) {
                this.setTimeout(() => this.screenLoop(), this.currentScreen.duration);
            }
        }
    }

    private clearTimeout() {
        if (this.screenTimeout) {
            clearTimeout(this.screenTimeout);
            this.screenTimeout = undefined;
        }
    }

    private setTimeout(callback: () => void, delay: number) {
        this.screenTimeout = setTimeout(callback, delay);
    }
}

export const screenManager = new ScreenManager(new LocalClient());
