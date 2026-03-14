import { TypedTransform } from "dc-streams";
import { SSMDB2InternalRange } from "../types";
import { InternalRange } from "dc-ranges-types";
import { TransformCallback } from "node:stream";
import { getDisciplineId } from "../cache/disciplines";

export class RangeDataTranslator extends TypedTransform<SSMDB2InternalRange, InternalRange> {

    _transform(
        chunk: SSMDB2InternalRange,
        encoding: BufferEncoding,
        callback: TransformCallback,
    ): void {
        const translated: InternalRange = {
            rangeId: chunk.rangeId,
            startListId: chunk.startListId,
            shooter: chunk.shooter ? { type: "byId", id: chunk.shooter } : { type: "free" },
            hits: chunk.hits,
            discipline: getDisciplineId(chunk.disciplineId, chunk.hits.length - 1),
            source: "ssmdb2",
            ttl: 25000,
        }
        this.push(translated);
        callback();
    }
}
