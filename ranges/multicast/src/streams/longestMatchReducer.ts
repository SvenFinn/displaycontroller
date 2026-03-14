import { TypedTransform } from "dc-streams";
import { Candidate, PacketCandidates, ResolvedPacketCandidates } from "../types";

export class LongestMatchReducer extends TypedTransform<PacketCandidates, ResolvedPacketCandidates> {
    private reduceToLongestMatch<T>(candidates: Candidate<T>[]): T | null {
        if (candidates.length === 0) {
            return null;
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
        return longest.data;
    }

    _transform(chunk: PacketCandidates, encoding: BufferEncoding, callback: () => void): void {
        const discipline = this.reduceToLongestMatch(chunk.disciplineCandidates);
        const startList = this.reduceToLongestMatch(chunk.startListCandidates);
        const shooter = this.reduceToLongestMatch(chunk.shooterCandidates);

        const reduced: ResolvedPacketCandidates = {
            id: chunk.id,
            disciplineCandidates: [],
            startListCandidates: [],
            shooterCandidates: [],
            discipline,
            startList,
            shooter

        };
        this.push(reduced);
        callback();
    }
}
