import { TypedTransform } from "dc-streams"
import { isOverride, ResolvedPacketCandidates } from "../types";
import { Index, InternalDiscipline, InternalRange, InternalShooter } from "dc-ranges/types";

export class RangeDataConverter extends TypedTransform<ResolvedPacketCandidates, InternalRange> {

    private resolveShooter(chunk: ResolvedPacketCandidates): InternalShooter | null {
        if (chunk.shooterCandidates.length > 0) {
            return null; // ambiguous, cannot resolve
        }
        if (chunk.shooter) {
            return chunk.shooter;
        }
        return { type: "free" };

    }

    private resolveDiscipline(chunk: ResolvedPacketCandidates): InternalDiscipline | null {
        const discipline = chunk.discipline;
        if (!discipline) {
            return null;
        }
        if (isOverride(discipline)) {
            return {
                overrideId: discipline.overrideId,
                roundId: discipline.roundId,
            };
        }
        return {
            disciplineId: discipline.disciplineId,
            roundId: discipline.roundId,
        };
    }

    private resolveStartList(chunk: ResolvedPacketCandidates): Index | null {
        return chunk.startList ? chunk.startList.id : null;
    }

    _transform(chunk: ResolvedPacketCandidates, encoding: BufferEncoding, callback: () => void): void {
        const range: InternalRange = {
            rangeId: chunk.id,
            discipline: this.resolveDiscipline(chunk),
            startListId: this.resolveStartList(chunk),
            shooter: this.resolveShooter(chunk),
            hits: [],
            source: "multicast",
            ttl: 20000
        };
        this.push(range);
        callback();
    }
}
