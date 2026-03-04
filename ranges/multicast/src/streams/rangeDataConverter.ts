import { TypedTransform } from "dc-streams"
import { Candidate, CandidateDiscipline, isOverride, PacketCandidates } from "../types";
import { InternalDiscipline, InternalRange } from "dc-ranges-types";
import { logger } from "dc-logger";

export class RangeDataConverter extends TypedTransform<PacketCandidates, InternalRange> {
    private resolveCandidate<T>(candidates: Candidate<T>[]): T | null {
        if (candidates.length !== 1) {
            return null;
        }
        return candidates[0].data;
    }

    private resolveDiscipline(candidates: Candidate<CandidateDiscipline>[]): InternalDiscipline | null {
        const candidate = this.resolveCandidate(candidates);
        if (!candidate) {
            return null;
        }
        if (isOverride(candidate)) {
            return {
                overrideId: candidate.overrideId,
                roundId: candidate.roundId,
            };
        }
        return {
            disciplineId: candidate.disciplineId,
            roundId: candidate.roundId,
        };
    }

    _transform(chunk: PacketCandidates, encoding: BufferEncoding, callback: () => void): void {
        const range: InternalRange = {
            rangeId: chunk.id,
            discipline: this.resolveDiscipline(chunk.disciplineCandidates),
            startListId: this.resolveCandidate(chunk.startListCandidates),
            shooter: this.resolveCandidate(chunk.shooterCandidates),
            hits: [],
            source: "multicast",
            ttl: 20000
        };
        this.push(range);
        callback();
    }
}
