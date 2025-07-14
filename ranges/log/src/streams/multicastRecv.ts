import { isInternalRange } from "dc-ranges-types";
import { ChannelModel } from "amqplib";
import { logger } from "dc-logger";
import { Readable } from "stream";

export class MulticastStream extends Readable {

    constructor(connection: ChannelModel) {
        super({ objectMode: true });
        this.connect(connection);
    }

    private async connect(connection: ChannelModel) {
        const channel = await connection.createChannel();
        await channel.assertExchange("ranges.multicast", "fanout", {
            durable: false,
        });
        const queue = await channel.assertQueue("", {
            exclusive: true,
        });
        channel.bindQueue(queue.queue, "ranges.multicast", "");
        channel.consume(queue.queue, async (msg) => {
            if (msg === null) {
                return;
            }
            const message = JSON.parse(msg.content.toString());
            if (isInternalRange(message)) {
                this.push(message);
            } else {
                logger.error("Received invalid multicast message");
            }
            channel.ack(msg);
        });
    }

    _read() {
        // Do nothing
    }
}