import { LocalClient } from "dc-db-local";
import { Discipline, isDiscipline, isOverrideDiscipline, InternalDiscipline, isInternalOverrideDiscipline, Index } from "dc-ranges-types";
import { logger } from "dc-logger";

let disciplines = new Map<Index, Discipline>();
let overrides = new Map<Index, Discipline>();

export async function updateDisciplines(localClient: LocalClient) {
    const newDisciplines = await localClient.cache.findMany({
        where: {
            type: "discipline",
        },
    });
    const disciplineTempMap = new Map<number, Discipline>();
    for (const discipline of newDisciplines) {
        if (!isDiscipline(discipline.value)) {
            continue;
        }
        disciplineTempMap.set(discipline.value.id, discipline.value);
    }

    disciplines = disciplineTempMap;
}

export async function updateOverrides(localClient: LocalClient) {
    const newOverridesMap = new Map<Index, Discipline>();

    const newOverrides = await localClient.cache.findMany({
        where: {
            type: "overrideDiscipline",
        },
    });
    for (const overrideDb of newOverrides) {
        const override = overrideDb.value;
        if (!isOverrideDiscipline(override)) {
            logger.warn(`Invalid override discipline: ${override}`);
            continue;
        }
        const disciplineDb = await localClient.cache.findUnique({
            where: {
                type_key: {
                    type: "discipline",
                    key: override.disciplineId,
                },
            },
        });
        if (!disciplineDb) {
            continue;
        }
        if (!isDiscipline(disciplineDb.value)) {
            logger.warn(`Invalid discipline ${disciplineDb.key}`);
            continue;
        }
        const discipline = disciplineDb.value;
        discipline.color = override.color;
        discipline.name = override.name;
        newOverridesMap.set(override.id, discipline);
    }

    overrides = newOverridesMap;
}

export function getDiscipline(internalDiscipline: InternalDiscipline | null): Discipline | null {
    if (internalDiscipline == null) {
        return null;
    }
    if (isInternalOverrideDiscipline(internalDiscipline)) {
        return structuredClone(overrides.get(internalDiscipline.overrideId) ?? null);
    }
    return structuredClone(disciplines.get(internalDiscipline.disciplineId) ?? null);
}


export function getRoundId(internalDiscipline: InternalDiscipline): number {
    return internalDiscipline.roundId;
}