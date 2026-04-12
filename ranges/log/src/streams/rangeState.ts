import { LocalClient } from "dc-db-local";
import { LogInternalRange, LogLine, LogMessage } from "../types";
import { logger } from "dc-logger";
import { Hits, RangeId } from "dc-ranges/types";
import { TypedTransform } from "dc-streams";

const LOG_TTL = 15000; // 15 seconds

export class RangeStateStream extends TypedTransform<LogMessage, LogInternalRange> {
    private ranges: Map<RangeId, LogInternalRange> = new Map();
    private freeTimeout: number = 30 * 60 * 1000;

    constructor(localClient: LocalClient) {
        super();
        this.getFreeTimeout(localClient);
        setInterval(() => this.ttlReemit(), LOG_TTL / 3 * 2);
    }

    private ttlReemit() {
        for (const rangeData of this.ranges.values()) {
            if (rangeData.shooter?.type === "free" && (Date.now() - rangeData.last_update.getTime()) > this.freeTimeout) {
                // If range is free and the last shot was more than freeTimeout ago, no longer emit it
                // As we hav no other way to know if a free range is still active
                // We do not remove it, because the shooter might still be there
                continue;
            }
            this.push(structuredClone(rangeData));
        }
    }

    private async getFreeTimeout(localClient: LocalClient) {
        this.freeTimeout = ((await localClient.parameter.findUniqueOrThrow({
            where: {
                key: "FREE_RANGE_SHOT_TIMEOUT",
            }
        })).numValue || 30 * 60 * 1000);
    }


    private createEmptyRange(chunk: LogLine): LogInternalRange {
        return {
            rangeId: chunk.rangeId,
            targetId: chunk.targetId,
            discipline: chunk.discipline,
            shooter: chunk.shooterId ? { type: "byId", id: chunk.shooterId } : null,
            hits: [],
            startListId: null,
            source: "log",
            ttl: LOG_TTL,
            last_update: chunk.timestamp,
        }
    }

    private addHitToRange(rangeData: LogInternalRange, chunk: LogLine): void {
        if (chunk.action !== "insert") return;

        const roundId = chunk.discipline.roundId;
        while (rangeData.hits.length <= roundId) {
            rangeData.hits.push([]);
        }

        const hits = rangeData.hits[roundId];
        const insertId = chunk.hit.id;

        // 1. Find insertion index BEFORE shifting
        let insertIndex = hits.findIndex(hit => hit.id >= insertId);
        if (insertIndex < 0) {
            insertIndex = hits.length;
        }

        for (const hit of hits) {
            if (hit.id >= insertId) {
                hit.id += 1;
            }
        }

        hits.splice(insertIndex, 0, { ...chunk.hit });
        hits.sort((a, b) => a.id - b.id);
    }

    private removeHitFromRange(rangeData: LogInternalRange, chunk: LogLine): void {
        if (chunk.action !== "delete") return;

        const roundId = chunk.discipline.roundId;
        const hits = rangeData.hits[roundId];
        if (!hits) {
            logger.warn(`Trying to remove hit from non - existing round ${roundId} in range ${chunk.rangeId} `);
            return;
        }

        const deleteId = chunk.hit.id;

        // 1. Try to remove hit with id = deleteId
        const hitIndex = hits.findIndex(hit => hit.id === deleteId);
        if (hitIndex !== -1) {
            hits.splice(hitIndex, 1);
        } else {
            logger.warn(
                `Deleting hole at id ${deleteId} in range ${chunk.rangeId}, round ${roundId} `
            );
        }

        // 2. Always shift hits with id > deleteId
        for (const hit of hits) {
            if (hit.id > deleteId) {
                hit.id -= 1;
            }
        }
        hits.sort((a, b) => a.id - b.id);

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

        rangeData.shooter = chunk.shooterId ? { type: "byId", id: chunk.shooterId } : { type: "free" };
        rangeData.discipline = chunk.discipline;
        rangeData.last_update = chunk.timestamp;
        if (chunk.action === "insert") {
            logger.info(`Adding hit ${chunk.hit.id} to range ${chunk.rangeId} `);
            this.addHitToRange(rangeData, chunk);
        } else {
            logger.info(`Removing hit ${chunk.hit.id} from range ${chunk.rangeId} `);
            this.removeHitFromRange(rangeData, chunk);
        }
        this.push(structuredClone(rangeData));
        callback();
    }
}