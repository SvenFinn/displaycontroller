import { isScreen, Screen } from "dc-screens-types";
import { logger } from "dc-logger";
import { sendSSEResponse } from "../server";
import amqp from "amqplib"
import { screenManager } from "./screenManager";

screenManager.on("screenChanged", (screen: Screen) => {
    sendSSEResponse(screen);
});

async function main() {
    const connection = await amqp.connect("amqp://rabbitmq");
    const channel = await connection.createChannel();
    await channel.assertQueue("screens.systemScreens", {
        durable: false,
        autoDelete: true,
        messageTtl: 10000
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
        if (!screen.available) return;
        screenManager.showScreenTemporarily(screen);
        setTimeout(() => {
            channel.ack(msg);
        }, 5000);
    });
    logger.info("Screen manager started");
}

main();