import { TypedTransform } from "dc-streams";
import { Candidate, PacketCandidates } from "../types";

export class ContainedCandidatesFilter extends TypedTransform<PacketCandidates, PacketCandidates> {
    private filterContainedCandidate<T>(candidates: Candidate<T>[]): Candidate<T>[] {
        // This should remove all candidates that are fully covered by another candidate.
        // It should not remove candidates that are the same length but different data, as they still add more information.
        // Should we do this for all candidate types independently or across all types? 

        const sorted = candidates.slice().sort((a, b) => a.start - b.start || b.end - a.end);
        const filtered: Candidate<T>[] = [];
        let lastEnd = -1;
        let lastStart = -1;
        for (const candidate of sorted) {
            if (candidate.end <= lastEnd && !(candidate.start === lastStart && candidate.end === lastEnd)) {
                continue;
            }
            filtered.push(candidate);
            lastEnd = Math.max(lastEnd, candidate.end);
            lastStart = candidate.start;
        }
        return filtered;
    }

    _transform(chunk: PacketCandidates, encoding: BufferEncoding, callback: () => void): void {
        const disciplineCandidates = this.filterContainedCandidate(chunk.disciplineCandidates);
        const startListCandidates = this.filterContainedCandidate(chunk.startListCandidates);
        const shooterCandidates = this.filterContainedCandidate(chunk.shooterCandidates);

        const filtered: PacketCandidates = {
            id: chunk.id,
            disciplineCandidates,
            startListCandidates,
            shooterCandidates
        };
        this.push(filtered);
        callback();
    }
}