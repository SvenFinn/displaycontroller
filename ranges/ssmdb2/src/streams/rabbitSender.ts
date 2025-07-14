import { Writable } from "stream";
import amqp from "amqplib";
import { InternalRange } from "dc-ranges-types";
import { logger } from "dc-logger";

export class RabbitSenderStream extends Writable {
    private channel: amqp.Channel | null = null;
    private currentState: Map<number, InternalRange> = new Map();

    constructor() {
        super({ objectMode: true });
        this.connect();
    }

    private async connect() {
        const connection = await amqp.connect("amqp://rabbitmq");
        this.channel = await connection.createChannel();
        await this.channel.assertExchange("ranges.ssmdb2", "fanout", {
            durable: false,
        });
    }

    _write(chunk: InternalRange, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        if (this.channel === null) {
            logger.error("Channel not connected");
            callback();
            return;
        }
        if (this.currentState.has(chunk.rangeId) && JSON.stringify(this.currentState.get(chunk.rangeId)) === JSON.stringify(chunk)) {
            callback();
            return;
        }
        this.currentState.set(chunk.rangeId, chunk);
        logger.info(`Sending range ${chunk.rangeId}`);
        this.channel.publish("ranges.ssmdb2", "", Buffer.from(JSON.stringify(chunk)));
        setTimeout(() => {
            this.currentState.delete(chunk.rangeId);
        }, 5000);
        callback();
    }
}