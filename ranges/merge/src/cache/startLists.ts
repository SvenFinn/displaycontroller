import { LocalClient } from "dc-db-local";
import { StartList, isInternalStartList, mergeMaps } from "dc-ranges-types";

export const startLists = new Map<number, StartList>();

export async function updateStartLists(localClient: LocalClient) {
    const newStartLists = await localClient.cache.findMany({
        where: {
            type: "startList",
        },
    });
    const startListTempMap = new Map<number, StartList>();
    for (const startList of newStartLists) {
        if (!isInternalStartList(startList.value)) {
            continue;
        }
        startListTempMap.set(startList.value.id, {
            id: startList.value.id,
            name: startList.value.name,
            type: startList.value.type,
        });
    }
    mergeMaps(startLists, startListTempMap);
}

export function getStartList(startListId: number | null): StartList | null {
    if (startListId == null) {
        return null;
    }
    return startLists.get(startListId) || null;
}