import { LocalClient } from "dc-db-local";
import { isDiscipline } from "@shared/ranges/discipline/index";
import { InternalDiscipline } from "@shared/ranges/internal";
import { isOverrideDiscipline, OverrideDiscipline } from "@shared/ranges/internal/startList";
import { mergeMaps } from "@shared/ranges/cache";

const overrideDisciplines = new Map<number, Map<string, InternalDiscipline>>();

export async function updateOverrides(client: LocalClient) {
    const overrideDisciplinesData = await client.cache.findMany({
        where: {
            type: "overrideDiscipline"
        }
    });
    const overrideDisciplinesTempMap = new Map<number, Map<string, InternalDiscipline>>();
    for (const overrideDisciplineDb of overrideDisciplinesData) {
        if (!isOverrideDiscipline(overrideDisciplineDb.value)) {
            continue;
        }
        const overrideDiscipline = overrideDisciplineDb.value;
        const originalDiscipline = await client.cache.findUnique({
            where: {
                type_key: {
                    type: "discipline",
                    key: overrideDiscipline.disciplineId
                }
            }
        });
        if (!originalDiscipline || !isDiscipline(originalDiscipline.value)) {
            continue;
        }
        const minRoundId = originalDiscipline.value.rounds.findIndex(round => round !== null);
        const startListId = Number(overrideDiscipline.startListId);
        if (!overrideDisciplinesTempMap.has(startListId)) {
            overrideDisciplinesTempMap.set(startListId, new Map());
        }
        overrideDisciplinesTempMap.get(startListId)!.set(overrideDiscipline.name, {
            overrideId: Number(overrideDiscipline.id),
            roundId: minRoundId
        });
    }
    mergeMaps(overrideDisciplines, overrideDisciplinesTempMap);
}

export function getOverrideDiscipline(startListId: number, message: string): InternalDiscipline | null {
    const disciplines = overrideDisciplines.get(startListId);
    if (!disciplines) {
        return null;
    }
    const keys = Array.from(disciplines.keys()).sort((a, b) => b.length - a.length);// sort by length descending
    for (const name of keys) {
        if (message.includes(name)) {
            return disciplines.get(name) || null;
        }
    }
    return null;
}