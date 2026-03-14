import { TypedTransform } from "dc-streams";
import { Candidate, PacketCandidates } from "../types";
import { logger } from "dc-logger";

export class ContainedCandidatesFilter extends TypedTransform<PacketCandidates, PacketCandidates> {
    private filterContainedCandidate<T>(candidates: Candidate<T>[]): Candidate<T>[] {
        // This should remove all candidates that are fully covered by another candidate.
        // It should not remove candidates that are the same length but different data, as they still add more information.

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

    private filterContainedOverlapsWithDifferentTypes<T>(candidates: Candidate<T>[], otherCandidates: Candidate<any>[]): Candidate<T>[] {
        // This should remove candidates that are fully covered by another candidate of a different type, as they likely don't add any information.
        // For example, if a discipline candidate is fully covered by a shooter candidate, it likely doesn't add any information, as the shooter candidate already implies the discipline.
        // it should not remove candidates that are the same length but different data, as they still add more information.

        const filtered: Candidate<T>[] = [];
        for (const candidate of candidates) {
            const isCovered = otherCandidates.some(other => other.start <= candidate.start && other.end >= candidate.end && !(other.start === candidate.start && other.end === candidate.end));
            if (!isCovered) {
                filtered.push(candidate);
            }
        }
        return filtered;
    }

    _transform(chunk: PacketCandidates, encoding: BufferEncoding, callback: () => void): void {
        const disciplineCandidates = this.filterContainedCandidate(chunk.disciplineCandidates);
        const startListCandidates = this.filterContainedCandidate(chunk.startListCandidates);
        const shooterCandidates = this.filterContainedCandidate(chunk.shooterCandidates);

        const filteredDisciplineCandidates = this.filterContainedOverlapsWithDifferentTypes(disciplineCandidates, [...startListCandidates, ...shooterCandidates]);
        const filteredShooterCandidates = this.filterContainedOverlapsWithDifferentTypes(shooterCandidates, [...disciplineCandidates, ...startListCandidates]);
        const filteredStartListCandidates = this.filterContainedOverlapsWithDifferentTypes(startListCandidates, [...disciplineCandidates, ...shooterCandidates]);

        logger.debug(`After filtering, ${filteredDisciplineCandidates.length} discipline candidates remain: ${filteredDisciplineCandidates.map(c => `${c.match} (${c.start},${c.end})`).join(", ")}`);
        logger.debug(`After filtering, ${filteredStartListCandidates.length} start list candidates remain: ${filteredStartListCandidates.map(c => `${c.match} (${c.start},${c.end})`).join(", ")}`);
        logger.debug(`After filtering, ${filteredShooterCandidates.length} shooter candidates remain: ${filteredShooterCandidates.map(c => `${c.match} (${c.start},${c.end})`).join(", ")}`);

        const filtered: PacketCandidates = {
            id: chunk.id,
            disciplineCandidates: filteredDisciplineCandidates,
            startListCandidates: filteredStartListCandidates,
            shooterCandidates: filteredShooterCandidates
        };
        this.push(filtered);
        callback();
    }
}