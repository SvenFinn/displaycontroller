import { checkServerAvailable, checkServiceAvailability } from "./checkServer";
import { updateServerState } from "./webServer";
import { AdvServerState } from "./types";
import { logger } from "dc-logger";
import amqp from "amqplib";
import { sendSystemScreen } from "./screens";

let serverState: boolean | null;
let amqpChannel: amqp.Channel;

async function updateServerInfo(serverInfo: AdvServerState) {
    updateServerState(serverInfo);
    sendSystemScreen(serverInfo, amqpChannel);
}

async function loop() {
    const serverOnline = await checkServerAvailable();
    if (serverState != serverOnline) {
        logger.info(`Server Availability changed to ${serverOnline}`)
        if (serverOnline) {
            const serverInfo = await checkServiceAvailability();
            if (!serverInfo) {
                return
            }
            updateServerInfo(serverInfo);
        } else {
            updateServerInfo({
                online: false
            });
        }
        serverState = serverOnline;
    }
}

async function main() {
    const connection = await amqp.connect("amqp://rabbitmq");
    amqpChannel = await connection.createChannel();
    await amqpChannel.assertQueue("screens.systemScreens", {
        durable: false,
        autoDelete: true,
        messageTtl: 10000
    });

    setInterval(loop, 2000);
}

main();