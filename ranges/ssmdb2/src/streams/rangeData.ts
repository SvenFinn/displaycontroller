import { Transform, TransformCallback } from "stream";
import { Ssmdb2Client } from "dc-db-ssmdb2";
import { InternalRange } from "@shared/ranges/internal";
import { Hits } from "@shared/ranges/hits";
import { getDisciplineId } from "../cache/disciplines";
import { logger } from "dc-logger";

export class RangeDataStream extends Transform {
    private prisma: Ssmdb2Client;

    constructor(prisma: Ssmdb2Client) {
        super({ objectMode: true });
        this.prisma = prisma;
    }

    async _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): Promise<void> {
        logger.debug("Received update from TableWatcherStream");
        const ranges = await this.getRanges();
        for (const range of ranges) {
            this.push(range);
        }
        callback();
    }

    private async getRanges(): Promise<InternalRange[]> {
        const localTime = new Date((new Date()).setMinutes((new Date()).getMinutes() - new Date().getTimezoneOffset()));
        const targets = await this.prisma.target.findMany(
            {
                where: {
                    timestamp:
                    {
                        gt: new Date(localTime.getTime() - 1000)
                    }
                },
                select: {
                    rangeId: true,
                    id: true,
                    timestamp: true,
                },
                orderBy: {
                    timestamp: 'desc'
                },
                distinct: ['rangeId'],
            });
        return (await Promise.all(targets.map(async (target) => this.getRangeData(target.id)))).filter((range) => range !== null) as InternalRange[];
    }
    private async getRangeData(targetId: number): Promise<InternalRange | null> {
        const data = await this.prisma.target.findUnique({
            where: {
                id: targetId
            }
        });
        if (data === null) {
            return null;
        }
        const hits = await this.getHits(targetId);
        return {
            rangeId: data.rangeId,
            startListId: data.startListId,
            shooter: data.shooterId,
            hits: hits,
            discipline: getDisciplineId(data.disciplineId, hits.length === 0 ? 0 : hits.length - 1),
            source: "ssmdb2",
            ttl: 15000
        }
    }

    private async getHits(targetId: number): Promise<Hits> {
        const hits = await this.prisma.shot.findMany({
            where: {
                targetId: targetId
            }
        });
        const result: Hits = [];
        for (const hit of hits) {
            const roundId = hit.roundId - 1;
            if (result[roundId] === undefined) {
                result[roundId] = [];
            }
            result[roundId]?.push({
                id: hit.id,
                x: hit.x / 100,
                y: hit.y / 100,
                divisor: hit.dividerHundredth / 100,
                rings: hit.ringsTenth / 10,
                innerTen: hit.innerTen
            });
        }
        return result.map((round) => round?.sort((a, b) => a.id - b.id)).map((round) => round === undefined ? null : round);
    }
}