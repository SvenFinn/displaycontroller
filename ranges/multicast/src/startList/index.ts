import { LocalClient } from "dc-db-local";
import { isStartList, mergeMaps } from "dc-ranges-types";

const matchStartLists = new Map<string, number>();

export async function updateStartList(client: LocalClient) {
    const startList = await client.cache.findMany({
        where: {
            type: "startList"
        }
    });
    const startListTempMap = new Map<string, number>();
    for (const list of startList) {
        if (!isStartList(list.value)) {
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
    const names = Array.from(matchStartLists.keys())
        .sort((a, b) => b.length - a.length); // longest first

    for (const name of names) {
        if (message.includes(name)) {
            return structuredClone(matchStartLists.get(name) ?? null);
        }
    }

    return null;
}