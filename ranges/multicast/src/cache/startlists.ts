import { Index, isOverrideDiscipline, isStartList } from "dc-ranges-types";
import { CandidateStartList, Matcher } from "../types";
import { LocalClient } from "dc-db-local";
import { createMatcher } from "./matcher";

export let potentialStartLists: Matcher<CandidateStartList> = createMatcher(new Map());

export async function updatePotentialStartLists(localClient: LocalClient) {
    const startLists: Map<string, CandidateStartList[]> = new Map();

    const overrideStartListIds = await getStartListOverrideSet(localClient);

    const startListData = await localClient.cache.findMany({
        where: {
            type: "startList"
        }
    });
    for (const startListDb of startListData) {
        if (!startListDb.value) {
            continue;
        }
        const startList = startListDb.value;
        if (!isStartList(startList)) {
            continue;
        }
        let entry = startLists.get(startList.name);
        if (!entry) {
            entry = [];
            startLists.set(startList.name, entry);
        }
        entry.push({
            id: startList.id,
            hasOverrideDisciplines: overrideStartListIds.has(startList.id)
        });
    }

    potentialStartLists = createMatcher(startLists);
}

async function getStartListOverrideSet(localClient: LocalClient): Promise<Set<Index>> {
    const overrideSet = new Set<Index>();
    const overrides = await localClient.cache.findMany({
        where: {
            type: "overrideDiscipline"
        }
    });
    for (const override of overrides) {
        if (!override.value) {
            continue;
        }
        const overrideData = override.value;
        if (!isOverrideDiscipline(overrideData)) {
            continue;
        }
        overrideSet.add(overrideData.startListId);
    }
    return overrideSet;
}