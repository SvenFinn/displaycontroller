import { Writable } from "stream";
import amqp, { ChannelModel } from "amqplib";
import { InternalRange } from "@shared/ranges/internal";
import { logger } from "dc-logger";

export class RabbitSenderStream extends Writable {
    private channel: amqp.Channel | null = null;
    private currentState: Map<number, String> = new Map();
    private resendTimeout: Map<number, NodeJS.Timeout> = new Map();

    constructor(connection: ChannelModel) {
        super({ objectMode: true });
        this.connect(connection);
    }

    private async connect(connection: ChannelModel) {
        this.channel = await connection.createChannel();
        await this.channel.assertExchange("ranges.log", "fanout", {
            durable: false,
        });
    }

    _write(chunk: InternalRange, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        if (this.channel === null) {
            logger.error("Channel not connected");
            callback();
            return;
        }
        if (this.currentState.has(chunk.rangeId) && this.currentState.get(chunk.rangeId) === JSON.stringify(chunk)) {
            logger.debug(`Range ${chunk.rangeId} already sent`);
            callback();
            return;
        }
        this.currentState.set(chunk.rangeId, JSON.stringify(chunk));
        if (this.resendTimeout.has(chunk.rangeId)) {
            clearTimeout(this.resendTimeout.get(chunk.rangeId)!);
        }
        logger.info(`Sending range ${chunk.rangeId}`);
        this.channel.publish("ranges.log", "", Buffer.from(JSON.stringify(chunk)));
        this.resendTimeout.set(chunk.rangeId, setTimeout(() => {
            this.currentState.delete(chunk.rangeId);
        }, 5000));
        callback();
    }
}