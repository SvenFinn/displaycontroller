import { LocalClient } from "dc-db-local";
import { Index, StartList, isStartList } from "dc-ranges/types";

let startLists = new Map<Index, StartList>();

export async function updateStartLists(localClient: LocalClient) {
    const newStartLists = await localClient.cache.findMany({
        where: {
            type: "startList",
        },
    });
    const startListTempMap = new Map<Index, StartList>();
    for (const startList of newStartLists) {
        if (!isStartList(startList.value)) {
            continue;
        }
        startListTempMap.set(startList.value.id, startList.value);
    }

    startLists = startListTempMap;
}

export function getStartList(startListId: Index | null): StartList | null {
    if (startListId == null) {
        return null;
    }
    return structuredClone(startLists.get(startListId) ?? null);
}