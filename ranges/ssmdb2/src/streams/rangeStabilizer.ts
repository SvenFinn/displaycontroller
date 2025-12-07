import { InternalRange } from "dc-ranges-types";
import { Transform, TransformCallback } from "stream";
import { logger } from "dc-logger";

type RangeStabilize = {
    data: InternalRange;
    timeout: NodeJS.Timeout;
}

export class StabilizerStream extends Transform {
    private readonly ranges: Map<number, RangeStabilize> = new Map();
    private readonly resetTime: number;

    constructor(resetTime: number) {
        super({ objectMode: true });
        this.resetTime = resetTime;
    }

    _transform(chunk: InternalRange, encoding: BufferEncoding, callback: TransformCallback): void {
        logger.debug(`Received range ${chunk.rangeId} from RangeDataStream`);
        if (!this.ranges.has(chunk.rangeId)) {
            this.ranges.set(chunk.rangeId, {
                data: chunk,
                timeout: setTimeout(() => {
                    this.ranges.delete(chunk.rangeId);
                }, this.resetTime)
            });
        }
        let changed = false;
        const existingData = structuredClone(this.ranges.get(chunk.rangeId)!.data);
        for (let i = 0; i < chunk.hits.length; i++) {
            const existingHits = existingData.hits[i];
            if (!existingHits) continue;
            const newHitsLength = chunk.hits[i]?.length || 0;
            if (existingHits.length > newHitsLength) {
                chunk.hits[i] = existingHits;
                changed = true;
                logger.debug(`Restored missing hits for range ${chunk.rangeId}, round ${i}`);
            }
        }
        if (chunk.discipline && existingData.discipline && chunk.discipline.roundId < existingData.discipline.roundId) {
            chunk.discipline.roundId = existingData.discipline.roundId;
            changed = true;
            logger.debug(`Restored roundId for range ${chunk.rangeId}`);
        }
        if (!changed) {
            clearTimeout(this.ranges.get(chunk.rangeId)!.timeout);
            this.ranges.set(chunk.rangeId, {
                data: chunk,
                timeout: setTimeout(() => {
                    this.ranges.delete(chunk.rangeId);
                }, this.resetTime)
            });
        }
        this.push(chunk);
        callback();
    }
}