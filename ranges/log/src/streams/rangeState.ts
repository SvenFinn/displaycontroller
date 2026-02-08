import { LogInternalRange, LogLine, LogMessage } from "../types";
import { logger } from "dc-logger";
import { Hits, RangeId } from "dc-ranges-types";
import { TypedTransform } from "dc-streams";

export class RangeStateStream extends TypedTransform<LogMessage, LogInternalRange> {
    private ranges: Map<RangeId, LogInternalRange> = new Map();

    private createEmptyRange(chunk: LogLine): LogInternalRange {
        return {
            rangeId: chunk.rangeId,
            targetId: chunk.targetId,
            discipline: chunk.discipline,
            shooter: chunk.shooterId || null, // Id is 0 if free
            hits: [],
            startListId: null,
            source: "log",
            ttl: 15000,
            last_update: chunk.timestamp,
        }
    }

    private normalizeHitIds(hits: Hits): void {
        for (let i = 0; i < hits.length; i++) {
            hits[i].id = i + 1;
        }
    }

    private addHitToRange(rangeData: LogInternalRange, chunk: LogLine): void {
        if (chunk.action !== "insert") return;

        const roundId = chunk.discipline.roundId;
        while (rangeData.hits.length <= roundId) {
            rangeData.hits.push([]);
        }

        const hits = rangeData.hits[roundId];

        const insertIndex = Math.max(0, Math.min(chunk.hit.id - 1, hits.length));
        hits.splice(insertIndex, 0, chunk.hit);

        this.normalizeHitIds(hits);
    }

    private removeHitFromRange(rangeData: LogInternalRange, chunk: LogLine): void {
        if (chunk.action !== "delete") return;

        const roundId = chunk.discipline.roundId;
        const hits = rangeData.hits[roundId];
        if (!hits) {
            logger.warn(`Trying to remove hit from non-existing round ${roundId} in range ${chunk.rangeId}`);
            return;
        }

        const hitIndex = hits.findIndex(hit => hit.id === chunk.hit.id);
        if (hitIndex === -1) {
            logger.warn(`Trying to remove non-existing hit ${chunk.hit.id} from range ${chunk.rangeId}, round ${roundId}`);
            return;
        }

        hits.splice(hitIndex, 1);
        this.normalizeHitIds(hits);
    }

    _transform(chunk: LogMessage, encoding: BufferEncoding, callback: () => void): void {
        if (chunk.action === "reset") {
            logger.info("Received reset action, clearing all ranges");
            this.ranges.clear();
            return callback();
        }
        let rangeData = this.ranges.get(chunk.rangeId);

        if (rangeData && rangeData.targetId !== chunk.targetId) {
            this.ranges.delete(chunk.rangeId);
            rangeData = undefined;
        }

        if (!rangeData) {
            logger.info(`Creating new range with id ${chunk.rangeId} for target ${chunk.targetId}`);
            rangeData = this.createEmptyRange(chunk);
            this.ranges.set(chunk.rangeId, rangeData);
        }

        rangeData.shooter = chunk.shooterId || null;
        rangeData.discipline = chunk.discipline;
        rangeData.last_update = chunk.timestamp;
        if (chunk.action === "insert") {
            logger.info(`Adding hit ${chunk.hit.id} to range ${chunk.rangeId}`);
            this.addHitToRange(rangeData, chunk);
        } else {
            logger.info(`Removing hit ${chunk.hit.id} from range ${chunk.rangeId}`);
            this.removeHitFromRange(rangeData, chunk);
        }
        this.push(structuredClone(rangeData));
        callback();
    }
}