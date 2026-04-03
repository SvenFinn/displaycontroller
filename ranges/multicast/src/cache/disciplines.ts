import { isDiscipline, isOverrideDiscipline } from "dc-ranges/types";
import { CandidateBaseDiscipline, CandidateDiscipline, CandidateOverrideDiscipline, Matcher } from "../types";
import { LocalClient } from "dc-db-local";
import { createMatcher } from "./matcher";

export let potentialDisciplines: Matcher<CandidateDiscipline> = createMatcher(new Map());

export async function updatePotentialDisciplines(localClient: LocalClient) {
    const disciplines = new Map<string, CandidateDiscipline[]>();

    const disciplineRoundIdMap = new Map<number, number>();
    const disciplineData = await localClient.cache.findMany({
        where: {
            type: "discipline"
        }
    });
    for (const disciplineDb of disciplineData) {
        if (!disciplineDb.value) {
            continue;
        }
        const discipline = disciplineDb.value;
        if (!isDiscipline(discipline)) {
            continue;
        }
        const roundId = discipline.rounds.findIndex(round => round !== null);
        if (roundId < 0) {
            continue;
        }

        disciplineRoundIdMap.set(discipline.id, roundId);

        let entry = disciplines.get(discipline.name);
        if (!entry) {
            entry = [];
            disciplines.set(discipline.name, entry);
        }

        const candidateDiscipline: CandidateBaseDiscipline = {
            disciplineId: discipline.id,
            roundId: roundId
        }
        entry.push(candidateDiscipline);
    }

    const overrideDisciplineData = await localClient.cache.findMany({
        where: {
            type: "overrideDiscipline"
        }
    });
    for (const overrideDisciplineDb of overrideDisciplineData) {
        if (!overrideDisciplineDb.value) {
            continue;
        }
        const overrideDiscipline = overrideDisciplineDb.value;
        if (!isOverrideDiscipline(overrideDiscipline)) {
            continue;
        }
        const roundId = disciplineRoundIdMap.get(overrideDiscipline.disciplineId);
        if (roundId === undefined) {
            continue;
        }

        let entry = disciplines.get(overrideDiscipline.name);
        if (!entry) {
            entry = [];
            disciplines.set(overrideDiscipline.name, entry);
        }

        const candidateDiscipline: CandidateOverrideDiscipline = {
            disciplineId: overrideDiscipline.disciplineId,
            roundId: roundId,
            overrideId: overrideDiscipline.id,
            startListId: overrideDiscipline.startListId
        }
        entry.push(candidateDiscipline);
    }
    potentialDisciplines = createMatcher(disciplines);
}   
