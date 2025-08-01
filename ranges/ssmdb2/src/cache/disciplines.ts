import { LocalClient } from "dc-db-local";
import { InternalDiscipline, mergeMaps } from "dc-ranges-types";

export const disciplineIdToObj = new Map<number, InternalDiscipline>();

export async function updateDisciplines(client: LocalClient) {
    const overrides = await client.cache.findMany({
        where: {
            type: "overrideDiscipline"
        }
    });
    const disciplineTempMap = new Map<number, InternalDiscipline>();
    for (const override of overrides) {
        disciplineTempMap.set(Number(override.key), {
            overrideId: Number(override.key),
            roundId: 0
        });
    }
    const disciplines = await client.cache.findMany({
        where: {
            type: "discipline"
        }
    });
    for (const discipline of disciplines) {
        disciplineTempMap.set(Number(discipline.key), {
            disciplineId: Number(discipline.key),
            roundId: 0
        });

    }
    mergeMaps(disciplineIdToObj, disciplineTempMap);
}

export function getDisciplineId(id: number, round: number): InternalDiscipline | null {
    const discipline = disciplineIdToObj.get(id) || null;
    if (discipline === null) {
        return null;
    }
    discipline.roundId = round;
    return discipline;
}
