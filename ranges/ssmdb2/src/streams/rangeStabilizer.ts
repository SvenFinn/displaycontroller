import { UnsignedInteger } from "dc-ranges-types";
import { Transform, TransformCallback } from "stream";
import { logger } from "dc-logger";
import { SSMDB2InternalRange } from "../types";

type RangeStabilize = {
    data: SSMDB2InternalRange;
    timeout: NodeJS.Timeout;
};

export class StabilizerStream extends Transform {
    private readonly ranges: Map<UnsignedInteger, RangeStabilize> = new Map();
    private readonly resetTime: number;

    constructor(resetTime: number) {
        super({ objectMode: true });
        this.resetTime = resetTime;
    }

    _transform(
        chunk: SSMDB2InternalRange,
        encoding: BufferEncoding,
        callback: TransformCallback,
    ): void {
        logger.debug(`Received range ${chunk.rangeId} from RangeDataStream`);
        if (!this.ranges.has(chunk.targetId)) {
            this.ranges.set(chunk.targetId, {
                data: chunk,
                timeout: setTimeout(() => {
                    this.ranges.delete(chunk.targetId);
                }, this.resetTime),
            });
        }
        let changed = false;
        const existingData = structuredClone(
            this.ranges.get(chunk.targetId)!.data,
        );
        for (let i = 0; i < chunk.hits.length; i++) {
            const existingHits = existingData.hits[i];
            if (!existingHits) continue;
            const newHitsLength = chunk.hits[i]?.length || 0;
            if (existingHits.length > newHitsLength) {
                chunk.hits[i] = existingHits;
                changed = true;
                logger.debug(
                    `Restored missing hits for range ${chunk.rangeId}, round ${i}`,
                );
            }
        }
        if (
            chunk.discipline &&
            existingData.discipline &&
            chunk.discipline.roundId < existingData.discipline.roundId
        ) {
            chunk.discipline.roundId = existingData.discipline.roundId;
            changed = true;
            logger.debug(`Restored roundId for range ${chunk.rangeId}`);
        }
        if (!changed) {
            clearTimeout(this.ranges.get(chunk.targetId)!.timeout);
            this.ranges.set(chunk.targetId, {
                data: chunk,
                timeout: setTimeout(() => {
                    this.ranges.delete(chunk.targetId);
                }, this.resetTime),
            });
        }
        this.push(chunk);
        callback();
    }
}
