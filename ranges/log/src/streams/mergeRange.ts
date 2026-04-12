import { TTLHandler } from "dc-ttl";
import { InternalDiscipline, InternalRange, isInternalOverrideDiscipline, isNormInternalDiscipline } from "dc-ranges/types";
import { LogInternalRange, MulticastInternalRange } from "../types";
import { isSameShooter } from "../cache/shooter";
import { getDisciplineId } from "../cache/overrides";
import { logger } from "dc-logger";
import { TypedTransform } from "dc-streams";

export class RangeMerger extends TypedTransform<MulticastInternalRange | LogInternalRange, InternalRange> {
    private multicastStates: Map<number, TTLHandler<MulticastInternalRange>> = new Map();
    private logStates: Map<number, TTLHandler<LogInternalRange>> = new Map();


    _transform(chunk: MulticastInternalRange | LogInternalRange, encoding: BufferEncoding, callback: (error?: Error | null, data?: any) => void): void {
        if (chunk.source == "multicast") {
            logger.debug(`Received multicast range ${chunk.rangeId}`);
            let entry = this.multicastStates.get(chunk.rangeId);
            if (!entry) {
                entry = new TTLHandler<MulticastInternalRange>();
                this.multicastStates.set(chunk.rangeId, entry);
            }
            entry.setMessage(chunk);
        } else {
            let entry = this.logStates.get(chunk.rangeId);
            if (!entry) {
                entry = new TTLHandler<LogInternalRange>();
                this.logStates.set(chunk.rangeId, entry);
            }
            entry.setMessage(chunk);
        }
        logger.debug(`Merging range ${chunk.rangeId}`);
        const merged = this.mergeStates(this.multicastStates.get(chunk.rangeId)?.getMessage() || null, this.logStates.get(chunk.rangeId)?.getMessage() || null);
        if (merged !== null) {
            this.push(merged);
        }
        callback();
    }

    private getDiscipline(multicastDiscipline: InternalDiscipline | null, logDiscipline: InternalDiscipline | null): InternalDiscipline | null {
        // If the multicast discipline is unknown, use the log discipline
        if (multicastDiscipline == null) return logDiscipline;
        // If the log discipline is invalid, use the multicast discipline
        if (!isNormInternalDiscipline(logDiscipline)) return multicastDiscipline;
        let multicastDisciplineId: number | null = null;
        // Get the disciplineId from the override if it's an override
        if (isInternalOverrideDiscipline(multicastDiscipline)) {
            multicastDisciplineId = getDisciplineId(multicastDiscipline.overrideId);
        } else {
            multicastDisciplineId = multicastDiscipline.disciplineId;
        }

        // If the multicast discipline is the same as the log discipline (or an override of the log discipline), use the multicast discipline
        // With the log discipline's roundId
        if (multicastDisciplineId == logDiscipline.disciplineId) return {
            ...multicastDiscipline,
            roundId: logDiscipline.roundId,
        }

        // If the multicast discipline is different from the log discipline, use the log discipline
        return logDiscipline;
    }


    private mergeStates(multicastState: MulticastInternalRange | null, logState: LogInternalRange | null): InternalRange | null {
        if (logState == null) return null; // Log state is absent, this wouldn't add any useful information
        if (multicastState == null) return null; // If range is offline
        if (logState.hits.flat().length == 0) return null; // If no hits are present (log wouldn't add any useful information)
        // Checks for the following cases:
        // - Multicast says range is free, but log says it's not -> Blacklist target
        // - Multicast says range is busy, but log says it's free -> Blacklist target
        // - Multicast reports a different shooter than log -> Blacklist target
        if (!isSameShooter(multicastState.shooter, logState.shooter)) {
            return null;
        }
        if (multicastState.onRangeSince > logState.last_update) {
            return null;
        }

        // We now have a valid state to merge
        return {
            rangeId: logState.rangeId,
            shooter: logState.shooter,
            hits: logState.hits,
            startListId: multicastState.startListId,
            discipline: this.getDiscipline(multicastState.discipline, logState.discipline),
            source: "log",
            ttl: Math.min(multicastState.ttl, logState.ttl),
        }
    }
}



