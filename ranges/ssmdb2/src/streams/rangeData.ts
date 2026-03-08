import { TransformCallback } from "stream";
import { Ssmdb2Client } from "dc-db-ssmdb2";
import { Hits, INVALID_HIT_POS, UnsignedInteger } from "dc-ranges-types";
import { getDisciplineId } from "../cache/disciplines";
import { logger } from "dc-logger";
import { getLocalMs } from "../utils";
import { SSMDB2InternalRange } from "../types";
import { TypedTransform } from "dc-streams";

export class RangeDataStream extends TypedTransform<string[], SSMDB2InternalRange> {
    private readonly prisma: Ssmdb2Client;
    private readonly timeoutMs: number;

    constructor(prisma: Ssmdb2Client, timeoutMs: number = 20000) {
        super();
        this.prisma = prisma;
        this.timeoutMs = timeoutMs;
    }

    async _transform(
        chunk: string[],
        encoding: BufferEncoding,
        callback: TransformCallback,
    ): Promise<void> {
        logger.debug("Received update from TableWatcherStream");
        const ranges = await this.getRanges();
        for (const range of ranges) {
            this.push(range);
        }
        callback();
    }

    private async getRanges(): Promise<SSMDB2InternalRange[]> {
        const version = (await this.prisma.version.findFirst())?.id ?? 0;
        const roundIdHasOffByOneBug = version < 8; // Versions before 8 have the roundId starting at 1 instead of 0
        const targets = await this.prisma.target.findMany({
            where: {
                timestamp: {
                    gt: new Date(getLocalMs() - this.timeoutMs),
                },
            },
            select: {
                rangeId: true,
                id: true,
                timestamp: true,
            },
            orderBy: {
                timestamp: "desc",
            },
            distinct: ["rangeId"],
        });
        return (
            await Promise.all(
                targets.map(async (target) =>
                    this.getRangeData(target.id, roundIdHasOffByOneBug),
                ),
            )
        ).filter((range) => range !== null) as SSMDB2InternalRange[];
    }
    private async getRangeData(
        targetId: UnsignedInteger,
        roundIdHasOffByOneBug: boolean,
    ): Promise<SSMDB2InternalRange | null> {
        const data = await this.prisma.target.findUnique({
            where: {
                id: targetId,
            },
        });
        if (data === null) {
            return null;
        }
        const hits = await this.getHits(targetId, roundIdHasOffByOneBug);
        return {
            targetId: targetId,
            rangeId: data.rangeId,
            startListId: data.startListId,
            shooter: data.shooterId ? { type: "byId", id: Number(data.shooterId) } : { type: "free" }, // Shooter can't be null, so 0 = free
            hits: hits,
            discipline: getDisciplineId(
                data.disciplineId,
                hits.length === 0 ? 0 : hits.length - 1,
            ),
            source: "ssmdb2",
            ttl: data.timestamp.getTime() - getLocalMs() + this.timeoutMs,
        };
    }

    private async getHits(
        targetId: number,
        roundIdHasOffByOneBug: boolean,
    ): Promise<Hits[]> {
        const hits = await this.prisma.hit.findMany({
            where: {
                targetId: targetId,
            },
        });
        const result: Hits[] = [];
        for (const hit of hits) {
            const roundId = roundIdHasOffByOneBug
                ? hit.roundId - 1
                : hit.roundId;
            if (result[roundId] === undefined) {
                result[roundId] = [];
            }
            if (hit.x >= INVALID_HIT_POS[0] && hit.y >= INVALID_HIT_POS[1]) {
                result[roundId]?.push({
                    id: hit.id,
                    valid: false,
                });
            } else {
                result[roundId]?.push({
                    id: hit.id,
                    x: hit.x / 100,
                    y: hit.y / 100,
                    divisor: hit.dividerHundredth / 100,
                    rings: hit.ringsTenth / 10,
                    innerTen: hit.innerTen,
                    valid: true,
                });
            }
        }
        return result
            .map((round) => round?.sort((a, b) => a.id - b.id))
            .map((round) => (round === undefined ? [] : round));
    }
}
