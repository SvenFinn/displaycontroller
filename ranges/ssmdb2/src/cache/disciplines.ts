import { LocalClient } from "dc-db-local";
import { InternalDiscipline, Index } from "dc-ranges/types";

let disciplineIdToObj = new Map<Index, InternalDiscipline>();

export async function updateDisciplines(client: LocalClient) {
    const overrides = await client.cache.findMany({
        where: {
            type: "overrideDiscipline"
        }
    });
    const disciplineTempMap = new Map<Index, InternalDiscipline>();
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

    disciplineIdToObj = disciplineTempMap;
}

export function getDisciplineId(id: Index, round: Index): InternalDiscipline | null {
    const discipline = disciplineIdToObj.get(id) ?? null;
    if (discipline === null) {
        return null;
    }
    return {
        ...discipline,
        roundId: round
    };
}