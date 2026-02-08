import { Channel, ChannelModel } from "amqplib";
import { logger } from "dc-logger";
import { TypedWritable } from "../core/writable.js";
import { IdFn } from "../index.js";

type State = {
    state: string,
    timeout: NodeJS.Timeout
};

export class RabbitMqWriter<T> extends TypedWritable<T> {
    private channel: Channel | null = null;
    private readonly exchanges: readonly string[];
    private readonly currentState: Map<string, State> = new Map();
    private readonly idFn: IdFn<T>;
    private readonly resendTimeout: number;
    private readonly ready: Promise<void>;

    constructor(connection: ChannelModel, exchanges: string[], idFn: IdFn<T>, resendTimeout: number = 5000) {
        super();
        this.idFn = idFn;
        this.resendTimeout = resendTimeout;
        this.exchanges = exchanges;

        this.ready = this.connect(connection, exchanges);
    }

    private async connect(connection: ChannelModel, exchanges: string[]) {
        const channel = await connection.createChannel();
        this.channel = channel;

        await Promise.all(
            exchanges.map(exchange =>
                channel.assertExchange(exchange, "fanout", { durable: false })
            )
        );
    }

    _write(chunk: T, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        this.ready
            .then(() => this._writeInternal(chunk, callback))
            .catch(err => callback(err));
    }

    private _writeInternal(chunk: T, callback: (error?: Error | null) => void) {
        try {
            if (this.channel === null) {
                return callback(new Error("RabbitMq channel not connected"));
            }

            const id = this.idFn(chunk);
            const json = JSON.stringify(chunk);

            const lastState = this.currentState.get(id);

            if (lastState && lastState.state === json) {
                logger.debug(`${id} already sent`);
                return callback();
            }

            if (lastState) {
                clearTimeout(lastState.timeout);
            }

            logger.debug(`Sending ${id}`);
            for (const exchange of this.exchanges) {
                this.channel.publish(exchange, "", Buffer.from(json));
            }

            const state: State = {
                state: json,
                timeout: setTimeout(() => {
                    this.currentState.delete(id);
                }, this.resendTimeout)
            };

            this.currentState.set(id, state);

            callback();
        } catch (err) {
            callback(err as Error);
        }
    }

    _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
        for (const state of this.currentState.values()) {
            clearTimeout(state.timeout);
        }
        this.currentState.clear();
        callback(error);
    }
}
