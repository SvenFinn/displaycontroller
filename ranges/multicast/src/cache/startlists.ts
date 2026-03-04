import { isStartList } from "dc-ranges-types";
import { CandidateStartList, Matcher } from "../types";
import { LocalClient } from "dc-db-local";
import { createMatcher } from "./matcher";

export let potentialStartLists: Matcher<CandidateStartList> = createMatcher(new Map());

export async function updatePotentialStartLists(localClient: LocalClient) {
    const startLists: Map<string, CandidateStartList[]> = new Map();

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
        entry.push(startList.id);
    }

    potentialStartLists = createMatcher(startLists);
}