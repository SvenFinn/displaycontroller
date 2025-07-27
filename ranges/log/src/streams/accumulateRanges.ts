import { Transform } from "stream";
import { LogInternalRange, LogMessage } from "../types";
import { logger } from "dc-logger";

const INVALID_HIT_POS = [2147483647, 2147483647];

export class AccumulateRanges extends Transform {
    private ranges: Map<number, LogInternalRange> = new Map();

    constructor() {
        super({ objectMode: true });
    }

    _transform(chunk: LogMessage, encoding: BufferEncoding, callback: () => void): void {
        if (chunk.action === "reset") {
            this.ranges.clear();
            callback();
            return;
        }
        if (chunk.timestamp < (new Date(Date.now() - 24 * 60 * 60 * 1000))) {
            callback();
            return;
        }
        if (chunk.targetId !== this.ranges.get(chunk.rangeId)?.targetId) {
            this.ranges.delete(chunk.rangeId);
        }
        const rangeData: LogInternalRange = this.ranges.get(chunk.rangeId) || {
            rangeId: chunk.rangeId,
            targetId: chunk.targetId,
            discipline: null,
            shooter: null,
            hits: [],
            startListId: null,
            source: "log",
            ttl: 15000,
            last_update: chunk.timestamp,
        }
        rangeData.shooter = chunk.shooter.id || null; // Id is 0 if free
        rangeData.discipline = { disciplineId: chunk.discipline.id, roundId: chunk.round.id };
        while (rangeData.hits.length - 1 < chunk.round.id) {
            rangeData.hits.push(null);
        }
        if (chunk.action === "insert") {
            logger.info(`Adding hit ${chunk.hit.id} to range ${chunk.rangeId}`);
            if (rangeData.hits[chunk.round.id] === null) {
                rangeData.hits[chunk.round.id] = [];
            }
            if (chunk.hit.x >= INVALID_HIT_POS[0] && chunk.hit.y >= INVALID_HIT_POS[1]) {
                // @ts-expect-error
                rangeData.hits[chunk.round.id].push({
                    id: chunk.hit.id,
                    valid: false,
                });
            } else {
                // @ts-expect-error
                rangeData.hits[chunk.round.id].push({
                    id: chunk.hit.id,
                    x: chunk.hit.x,
                    y: chunk.hit.y,
                    divisor: chunk.hit.divisor,
                    rings: chunk.hit.rings,
                    innerTen: chunk.hit.innerRing,
                    valid: true
                });
            }
            rangeData.hits[chunk.round.id]?.forEach((hit, index) => {
                hit.id = index + 1;
                return hit;
            })

        } else {
            logger.info(`Removing hit ${chunk.hit.id} from range ${chunk.rangeId}`);
            if (rangeData.hits[chunk.round.id] === null) {
                callback();
                return;
            }
            rangeData.hits[chunk.round.id] = rangeData.hits[chunk.round.id]?.filter(hit => hit.id !== chunk.hit.id) || null;
            rangeData.hits[chunk.round.id]?.forEach(hit => {
                if (hit.id > chunk.hit.id) {
                    hit.id--;
                }
                return hit;
            });
        }
        rangeData.hits[chunk.round.id]?.sort((a, b) => a.id - b.id);
        rangeData.last_update = chunk.timestamp;
        this.ranges.set(chunk.rangeId, rangeData);
        this.push(rangeData);
        callback();
    }
}