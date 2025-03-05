import { LocalClient } from "dc-db-local";
import { isDiscipline } from "@shared/ranges/discipline/index";
import { InternalDiscipline } from "@shared/ranges/internal";
import { getOverrideDiscipline } from "./overrides";

const matchDiscipline = new Map<string, InternalDiscipline>();

export async function updateDisciplines(client: LocalClient) {
    const disciplines = await client.cache.findMany({
        where: {
            type: "discipline"
        }
    });
    matchDiscipline.clear();
    for (const discipline of disciplines) {
        if (!isDiscipline(discipline.value)) {
            continue;
        }
        matchDiscipline.set(`${discipline.value.name}\0`, {
            disciplineId: Number(discipline.key),
            roundId: discipline.value.rounds.findIndex(round => round !== null)
        });
    }
}

export function getDiscipline(startListId: number | null, message: string): InternalDiscipline | null {
    if (startListId !== null) {
        const overrideDiscipline = getOverrideDiscipline(startListId, message);
        if (overrideDiscipline) {
            return overrideDiscipline;
        }
    }
    const keys = Array.from(matchDiscipline.keys()).sort((a, b) => b.length - a.length);// sort by length descending
    for (const name of keys) {
        if (message.includes(name)) {
            return matchDiscipline.get(name) || null;
        }
    }
    return null;
}