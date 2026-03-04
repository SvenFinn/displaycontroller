import { TypedTransform } from "dc-streams";
import { IdentifiedRange } from "./rangeId";
import { Candidate, Matcher, PacketCandidates } from "../types";
import { TransformCallback } from "node:stream";
import { potentialDisciplines } from "../cache/disciplines";
import { potentialStartLists } from "../cache/startlists";
import { potentialShooters } from "../cache/shooters";
import { logger } from "dc-logger";

export class CandidateExtractor extends TypedTransform<IdentifiedRange, PacketCandidates> {

    private findCandidates<T>(packet: string, matcher: Matcher<T>): Candidate<T>[] {
        const matches = matcher.matcher.search(packet);
        const candidates: Candidate<T>[] = [];
        for (const [position, needles] of matches) {

            for (const needle of needles) {
                const data = matcher.candidates.get(needle);

                if (!data) {
                    continue;
                }

                const end = position + needle.length;
                candidates.push(...data.map(candidateData => ({
                    start: position,
                    end,
                    data: candidateData,
                    match: needle
                })));
            }
        }
        return candidates;
    }

    _transform(chunk: IdentifiedRange, encoding: BufferEncoding, callback: TransformCallback): void {
        logger.info(`Received packet from range ${chunk.id}`);

        const disciplineCandidates = this.findCandidates(chunk.packet, potentialDisciplines);
        const startListCandidates = this.findCandidates(chunk.packet, potentialStartLists);
        const shooterCandidates = this.findCandidates(chunk.packet, potentialShooters);

        const candidates: PacketCandidates = {
            id: chunk.id,
            disciplineCandidates,
            startListCandidates,
            shooterCandidates
        };

        this.push(candidates);
        callback();
    }
}