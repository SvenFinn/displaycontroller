import { TypedTransform } from "dc-streams";
import { Candidate, PacketCandidates } from "../types";

export class LongestMatchReducer extends TypedTransform<PacketCandidates, PacketCandidates> {
    private reduceToLongestMatch<T>(candidates: Candidate<T>[]): Candidate<T>[] {
        if (candidates.length === 0) {
            return [];
        }

        let longest = candidates[0];
        let longestLength = longest.end - longest.start;
        for (const candidate of candidates) {
            const len = candidate.end - candidate.start;
            if (len > longestLength) {
                longest = candidate;
                longestLength = len;
            }
        }
        return [longest];
    }

    _transform(chunk: PacketCandidates, encoding: BufferEncoding, callback: () => void): void {
        const disciplineCandidates = this.reduceToLongestMatch(chunk.disciplineCandidates);
        const startListCandidates = this.reduceToLongestMatch(chunk.startListCandidates);
        const shooterCandidates = this.reduceToLongestMatch(chunk.shooterCandidates);

        const reduced: PacketCandidates = {
            id: chunk.id,
            disciplineCandidates,
            startListCandidates,
            shooterCandidates
        };
        this.push(reduced);
        callback();
    }
}
