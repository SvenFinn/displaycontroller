import { ChannelModel, Channel, Message } from "amqplib";
import { logger } from "dc-logger";
import { TypedReadable } from "../core/readable.js";

type IsFn<T> = (input: unknown) => input is T;

export class RabbitMqReceiver<T> extends TypedReadable<T> {
    private paused = false;
    private pendingMsg: Message | null = null;
    private channel: Channel | null = null;
    private readonly isFn: IsFn<T>;

    constructor(connection: ChannelModel, exchanges: Array<string>, isFn: IsFn<T>) {
        super();
        this.isFn = isFn;
        this.connect(connection, exchanges);
    }

    private async connect(connection: ChannelModel, exchanges: Array<string>) {
        const channel = await connection.createChannel();
        this.channel = channel;

        await channel.prefetch(1);
        await Promise.all(exchanges.map(async (exchange) => {
            await channel.assertExchange(exchange, "fanout", { durable: false });
        }));

        const queue = await channel.assertQueue("", { exclusive: true });
        await Promise.all(exchanges.map(async (exchange) => {
            await channel.bindQueue(queue.queue, exchange, "");
        }));

        channel.consume(queue.queue, (msg) => {
            if (!msg || this.paused) return;

            const message = JSON.parse(msg.content.toString());
            if (!this.isFn(message)) {
                logger.error("Received invalid message");
                channel.ack(msg);
                return;
            }

            const ok = this.push(message);
            if (ok) {
                channel.ack(msg);
            } else {
                this.paused = true;
                this.pendingMsg = msg;
            }
        });
    }

    _read() {
        if (!this.paused || !this.pendingMsg || !this.channel) {
            return;
        }

        const msg = this.pendingMsg;
        this.pendingMsg = null;

        const message = JSON.parse(msg.content.toString());

        const ok = this.push(message);
        if (ok) {
            this.channel.ack(msg);
            this.paused = false;
        } else {
            this.pendingMsg = msg;
        }
    }
}
