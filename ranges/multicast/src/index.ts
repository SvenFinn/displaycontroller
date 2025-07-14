import "./updater";
import { isRangeProxy } from "../proxy/src/types";
import amqp from "amqplib";
import { getStartList } from "./startList";
import { getDiscipline } from "./discipline";
import { getShooters } from "./shooter";
import { getRangeId } from "./rangeId";
import { LocalClient } from "dc-db-local";
import { InternalRange } from "dc-ranges-types";
import { logger } from "dc-logger";

const prismaClient = new LocalClient();

async function main() {
    const connection = await amqp.connect("amqp://rabbitmq");
    const channel = await connection.createChannel();
    await channel.assertQueue("ranges.multicast.proxy", {
        durable: false,
        autoDelete: true,
        messageTtl: 30000
    });
    await channel.assertExchange("ranges.multicast", "fanout", {
        durable: false,
    });
    channel.consume("ranges.multicast.proxy", async (msg) => {
        if (msg === null) {
            return;
        }
        const message = JSON.parse(msg.content.toString());
        if (!isRangeProxy(message)) {
            return;
        }
        const multicastMessage = Buffer.from(message.message, "base64").toString();
        const rangeData = await getRangeData(multicastMessage, message.ip);
        if (rangeData === null) {
            logger.error("Failed to parse range data for " + message.ip);
            return;
        }
        logger.info(`Parsed data for range ${rangeData.rangeId} (${message.ip})`);
        channel.publish("ranges.multicast", "", Buffer.from(JSON.stringify(rangeData)));
        channel.ack(msg);
    });
}

async function getRangeData(message: string, rangeIp: string): Promise<InternalRange | null> {
    const rangeId = await getRangeId(prismaClient, rangeIp);
    if (rangeId === null) {
        return null;
    }
    const startList = getStartList(message);
    const discipline = getDiscipline(startList, message);
    const shooter = getShooters(message);
    return {
        rangeId: rangeId,
        startListId: startList,
        shooter: shooter,
        discipline: discipline,
        hits: [],
        source: "multicast",
        ttl: 20000
    }
}

main();
