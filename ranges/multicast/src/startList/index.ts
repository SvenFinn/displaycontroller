import { LocalClient } from "dc-db-local";
import { isInternalStartList, mergeMaps } from "dc-ranges-types";

const matchStartLists = new Map<string, number>();

export async function updateStartList(client: LocalClient) {
    const startList = await client.cache.findMany({
        where: {
            type: "startList"
        }
    });
    const startListTempMap = new Map<string, number>();
    for (const list of startList) {
        if (!isInternalStartList(list.value)) {
            continue;
        }
        if (!list.value.name) {
            continue;
        }
        startListTempMap.set(list.value.name, Number(list.key));
    }
    mergeMaps(matchStartLists, startListTempMap);
}

export function getStartList(message: string): number | null {
    let currentStartList: number | null = null;
    let currentStartListName = "";
    for (const [name, key] of matchStartLists) {
        if (currentStartListName.length < name.length && message.match(new RegExp(name)) !== null) {
            currentStartList = key;
            currentStartListName = name;
        }
    }
    return currentStartList;
}