import { InternalRange } from "dc-ranges-types";
import { Transform, TransformCallback } from "stream";
import { logger } from "dc-logger";

export class DebounceStream extends Transform {
    private ranges: Map<number, NodeJS.Timeout> = new Map();
    private debounceTime: number;

    constructor(debounceTime: number) {
        super({ objectMode: true });
        this.debounceTime = debounceTime;
    }

    _transform(chunk: InternalRange, encoding: BufferEncoding, callback: TransformCallback): void {
        logger.debug(`Debouncing range ${chunk.rangeId}`);
        if (this.ranges.has(chunk.rangeId)) {
            if (JSON.stringify(this.ranges.get(chunk.rangeId)) === JSON.stringify(chunk)) {
                logger.debug(`Skipping range ${chunk.rangeId} due to no changes`);
                callback();
                return;
            }
            clearTimeout(this.ranges.get(chunk.rangeId)!);
        }
        this.ranges.set(chunk.rangeId,
            setTimeout(() => {
                this.push(chunk);
                this.ranges.delete(chunk.rangeId);
            }, this.debounceTime)
        );
        callback();
    }
}