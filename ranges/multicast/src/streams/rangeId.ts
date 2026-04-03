import { TypedTransform } from "dc-streams";
import { RangeProxyType } from "../../proxy/src/types";
import { LocalClient } from "dc-db-local";
import { logger } from "dc-logger";
import { RangeId } from "dc-ranges/types";

export type IdentifiedRange = {
    id: RangeId;
    packet: string;
}

export class RangeIdentifier extends TypedTransform<RangeProxyType, IdentifiedRange> {
    private readonly prismaClient: LocalClient;

    constructor(prismaClient: LocalClient) {
        super();
        this.prismaClient = prismaClient;
    }

    async resolveRangeId(rangeMac: string, rangeIp: string): Promise<number | null> {
        const existing = await this.prismaClient.knownRanges.findUnique({
            where: { macAddress: rangeMac }
        });

        if (existing) {
            if (existing.lastIp !== rangeIp) {
                await this.prismaClient.knownRanges.update({
                    where: { macAddress: rangeMac },
                    data: { lastIp: rangeIp }
                });
            }

            return existing.rangeId;
        }

        // MAC not known → derive ID
        let rangeId: number | null = null;

        const parts = rangeIp.split(".");
        if (parts.length !== 4) {
            logger.warn(`Invalid IP ${rangeIp} for range with mac ${rangeMac}`);
            return null
        }

        const candidate = parseInt(parts[3], 10);
        if (isNaN(candidate)) {
            logger.warn(`Invalid IP ${rangeIp} for range with mac ${rangeMac}`);
            return null
        }

        const exists = await this.prismaClient.knownRanges.findUnique({
            where: { rangeId: candidate }
        });

        if (!exists) {
            rangeId = candidate;
        } else {
            logger.warn(`Range ID ${candidate} already exists`);
        }

        // Safe insert
        const created = await this.prismaClient.knownRanges.upsert({
            where: { macAddress: rangeMac },
            update: { lastIp: rangeIp },
            create: {
                macAddress: rangeMac,
                lastIp: rangeIp,
                rangeId: rangeId
            }
        });

        return created.rangeId;
    }

    async _transform(value: RangeProxyType, encoding: BufferEncoding, callback: (error?: Error | null, data?: IdentifiedRange) => void): Promise<void> {
        try {
            const rangeId = await this.resolveRangeId(value.mac, value.ip);
            if (!rangeId) {
                logger.warn(`Could not resolve range id for range with mac ${value.mac} and ip ${value.ip}, skipping packet`);
            } else {
                this.push({
                    id: rangeId,
                    packet: value.message
                });
            }
            callback();
        } catch (error) {
            logger.error(`Error while getting range id for range with mac ${value.mac} and ip ${value.ip}: ${error}`);
            callback(error as Error);
        }
    }
}
