import { InternalRange } from "dc-ranges-types";
import { Transform, TransformCallback } from "stream";
import { logger } from "dc-logger";

type RangeDebounce = {
    data: InternalRange;
    debounce: NodeJS.Timeout;
}

export class DebounceStream extends Transform {
    private ranges: Map<number, RangeDebounce> = new Map();
    private debounceTime: number;

    constructor(debounceTime: number) {
        super({ objectMode: true });
        this.debounceTime = debounceTime;
    }

    _transform(chunk: InternalRange, encoding: BufferEncoding, callback: TransformCallback): void {
        logger.debug(`Received range ${chunk.rangeId} from RangeDataStream`);
        if (this.ranges.has(chunk.rangeId)) {
            clearTimeout(this.ranges.get(chunk.rangeId)!.debounce);
        }
        this.ranges.set(chunk.rangeId, {
            data: chunk,
            debounce: setTimeout(() => {
                this.push(chunk);
                this.ranges.delete(chunk.rangeId);
            }, this.debounceTime)
        });
        callback();
    }
}