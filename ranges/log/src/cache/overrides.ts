import { Index, isOverrideDiscipline } from "dc-ranges-types";
import { LocalClient } from "dc-db-local";

let overrideToDiscipline = new Map<Index, Index>();

export async function updateOverrides(client: LocalClient) {
    const overrides = await client.cache.findMany({
        where: {
            type: "overrideDiscipline"
        }
    });
    const overrideTempMap = new Map<Index, Index>();
    for (const override of overrides) {
        if (!isOverrideDiscipline(override.value)) {
            continue;
        }
        overrideTempMap.set(override.value.id, Number(override.value.disciplineId));
    }

    overrideToDiscipline = overrideTempMap;
}

export function getDisciplineId(overrideId: Index): Index | null {
    return overrideToDiscipline.get(overrideId) ?? null;
}