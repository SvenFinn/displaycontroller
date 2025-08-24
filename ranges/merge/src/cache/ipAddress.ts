import { LocalClient } from "dc-db-local";
import { mergeMaps } from "dc-ranges-types";

export const ipAddresses = new Map<number, string>();

export async function updateIpAddresses(localClient: LocalClient) {
    const newDisciplines = await localClient.knownRanges.findMany({
        where: {
            rangeId: {
                not: null,
            }
        },
        select: {
            rangeId: true,
            lastIp: true,
        },
    });

    const ipAddressTempMap = new Map<number, string>();
    for (const ipAddress of newDisciplines) {
        if (ipAddress.rangeId === null || ipAddress.lastIp === null) {
            continue;
        }
        ipAddressTempMap.set(ipAddress.rangeId, ipAddress.lastIp);
    }
    mergeMaps(ipAddresses, ipAddressTempMap);
}

export function getIpAddress(rangeId: number): string | null {
    return ipAddresses.get(rangeId) || null;
}