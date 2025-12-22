import { LocalClient } from "dc-db-local";
import { StartList, isStartList, mergeMaps } from "dc-ranges-types";
import { start } from "repl";

export const startLists = new Map<number, StartList>();

export async function updateStartLists(localClient: LocalClient) {
    const newStartLists = await localClient.cache.findMany({
        where: {
            type: "startList",
        },
    });
    const startListTempMap = new Map<number, StartList>();
    for (const startList of newStartLists) {
        if (!isStartList(startList.value)) {
            continue;
        }
        startListTempMap.set(startList.value.id, startList.value);
    }
    mergeMaps(startLists, startListTempMap);
}

export function getStartList(startListId: number | null): StartList | null {
    if (startListId == null) {
        return null;
    }
    return structuredClone(startLists.get(startListId) ?? null);
}