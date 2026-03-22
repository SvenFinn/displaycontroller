import { TransformCallback } from "node:stream";
import { logger } from "dc-logger";
import { TypedTransform } from "../core/transform.js";
import { IdFn } from "../index.js";

type DebounceData<T> = {
    data: T
    json: string,
    timeout: NodeJS.Timeout
}

export class DebounceTransform<T> extends TypedTransform<T, T> {
    private readonly data: Map<string, DebounceData<T>> = new Map();
    private readonly debounceTime: number;
    private readonly idFn: IdFn<T>;

    constructor(idFn: IdFn<T>, debounceTime: number = 300) {
        super();
        this.idFn = idFn;
        this.debounceTime = debounceTime;
    }

    _transform(chunk: T, encoding: BufferEncoding, callback: TransformCallback): void {
        const id = this.idFn(chunk);
        const json = JSON.stringify(chunk);

        const entry = this.data.get(id);
        if (entry && entry.json === json) {
            logger.debug(`Skipping chunk ${id} due to no changes`);
            return callback();
        }
        if (entry) {
            clearTimeout(entry.timeout);
        }
        const newEntry = {
            data: chunk,
            json: json,
            timeout: setTimeout(() => {
                const current = this.data.get(id);
                if (current === newEntry) {
                    this.data.delete(id);
                    if (!this.destroyed) {
                        this.push(newEntry.data);
                    }
                }
            }, this.debounceTime)
        };
        this.data.set(id, newEntry);
        callback();
    }

    _flush(callback: TransformCallback): void {
        for (const state of this.data.values()) {
            clearTimeout(state.timeout);

            if (!this.destroyed) {
                this.push(state.data);
            }
        }
        this.data.clear();
        callback();
    }

    _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
        for (const state of this.data.values()) {
            clearTimeout(state.timeout);
            // We do not push the data here, as the stream is already dead when this is called
        }
        this.data.clear();
        callback(error);
    }
}