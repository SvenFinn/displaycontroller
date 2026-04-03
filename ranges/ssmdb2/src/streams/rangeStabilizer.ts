import { UnsignedInteger } from "dc-ranges/types";
import { TransformCallback } from "stream";
import { logger } from "dc-logger";
import { SSMDB2InternalRange } from "../types";
import { TypedTransform } from "dc-streams";

type StableCandidate = {
    data: SSMDB2InternalRange;
    hash: string;
    timeout: NodeJS.Timeout;
}

type RangeStabilize = {
    stable: StableCandidate;
    candidate?: StableCandidate;
};

export class StabilizerStream extends TypedTransform<SSMDB2InternalRange, SSMDB2InternalRange> {
    private readonly ranges: Map<UnsignedInteger, RangeStabilize> = new Map();
    private readonly resetTime: number;
    private readonly candidateAcceptTime: number;

    constructor(candidateAcceptTime: number, resetTime: number) {
        super();
        this.resetTime = resetTime;
        this.candidateAcceptTime = candidateAcceptTime;
    }

    private hashRange(range: SSMDB2InternalRange): string {
        return JSON.stringify(range);
    }

    private isMoreHits(oldRange: SSMDB2InternalRange, newRange: SSMDB2InternalRange): boolean {
        const newHits = newRange.hits;
        const oldHits = oldRange.hits;
        if (newHits.length > oldHits.length) {
            return true;
        }
        if (newHits.length < oldHits.length) {
            return false;
        }
        for (let i = 0; i < newHits.length; i++) {
            if (oldHits[i] === undefined && newHits[i].length > 0) {
                return true;
            }
            if (oldHits[i] === undefined && newHits[i] === undefined) {
                continue;
            }
            if (newHits[i].length > oldHits[i].length) {
                return true;
            }
        }
        return false;
    }

    _transform(
        chunk: SSMDB2InternalRange,
        encoding: BufferEncoding,
        callback: TransformCallback,
    ): void {
        logger.debug(`Received range ${chunk.rangeId} from RangeDataStream`);
        const entry = this.ranges.get(chunk.targetId);
        if (!entry) {
            this.ranges.set(chunk.targetId, {
                stable: {
                    data: chunk,
                    hash: this.hashRange(chunk),
                    timeout: setTimeout(() => {
                        this.ranges.delete(chunk.targetId);
                    }, this.resetTime),
                }
            });
            this.push(structuredClone(chunk));
            callback();
            return;
        }

        const stable = entry.stable;

        if (this.isMoreHits(stable.data, chunk)) {
            logger.info(`Accepting new range ${chunk.rangeId} with more hits (${chunk.hits.flat().length} hits) than stable range (${stable.data.hits.flat().length} hits)`);
            stable.data.hits = chunk.hits;
            stable.hash = this.hashRange(stable.data);
            stable.timeout.refresh();
            if (entry.candidate) {
                clearTimeout(entry.candidate.timeout);
                delete entry.candidate;
            }
            this.push(structuredClone(stable.data));
            callback();
            return;
        }

        const chunkHash = this.hashRange(chunk);

        if (stable.hash === chunkHash) {
            stable.timeout.refresh();
            if (entry.candidate) {
                clearTimeout(entry.candidate.timeout);
                delete entry.candidate;
            }
            this.push(structuredClone(stable.data));
            callback();
            return;
        }

        if (!entry.candidate) {
            entry.candidate = {
                data: chunk,
                hash: chunkHash,
                timeout: setTimeout(() => {
                    if (entry.candidate) {
                        entry.stable.data = structuredClone(entry.candidate.data);
                        entry.stable.hash = entry.candidate.hash;
                        delete entry.candidate;
                        stable.timeout.refresh();
                        this.push(structuredClone(entry.stable.data));
                    }
                }, this.candidateAcceptTime),
            };
        } else {
            entry.candidate.data = chunk;
            entry.candidate.hash = chunkHash;
            entry.candidate.timeout.refresh();
        }
        this.push(structuredClone(stable.data));
        callback();
        return;
    }
}