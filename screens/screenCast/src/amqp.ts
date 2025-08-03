import amqp from "amqplib";
import { logger } from "dc-logger";
import { Screen } from "dc-screens-types";

const MAX_DB_NUM = 2147483647;

let amqpChannel: amqp.Channel | null = null;
let screenInterval: NodeJS.Timeout | null = null;

export function startScreenCast() {
    if (screenInterval) {
        clearInterval(screenInterval);
        screenInterval = null;
    }
    screenInterval = setInterval(() => {
        if (!amqpChannel) return;
        const screen: Screen = {
            available: true,
            type: "screenCast",
            options: {},
            duration: 10000,
            id: MAX_DB_NUM,
            subId: 0,
        };
        amqpChannel.sendToQueue("screens.systemScreens", Buffer.from(JSON.stringify(screen)));
    }, 5000);
}

export function stopScreenCast() {
    if (screenInterval) {
        clearInterval(screenInterval);
        screenInterval = null;
    }
}

async function main() {
    const connection = await amqp.connect("amqp://rabbitmq");
    const channel = await connection.createChannel();
    await channel.assertQueue("screens.systemScreens", {
        durable: false,
        autoDelete: true,
        messageTtl: 10000
    });
    amqpChannel = channel;
}

main();