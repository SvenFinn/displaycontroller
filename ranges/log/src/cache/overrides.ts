import { isOverrideDiscipline } from "@shared/ranges/internal/startList";
import { LocalClient } from "dc-db-local";
import { mergeMaps } from "@shared/ranges/cache";

const overrideToDiscipline = new Map<number, number>();

export async function updateOverrides(client: LocalClient) {
    const overrides = await client.cache.findMany({
        where: {
            type: "overrideDiscipline"
        }
    });
    const overrideTempMap = new Map<number, number>();
    for (const override of overrides) {
        if (!isOverrideDiscipline(override.value)) {
            continue;
        }
        overrideTempMap.set(override.value.id, Number(override.value.disciplineId));
    }
    mergeMaps(overrideToDiscipline, overrideTempMap);
}

export function getDisciplineId(overrideId: number): number | null {
    return overrideToDiscipline.get(overrideId) || null;
}