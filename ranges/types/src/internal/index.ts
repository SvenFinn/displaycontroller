import { Hits } from "../hits";
import { Source } from "../index";
import { createIs } from "typia";

export type InternalRange = {
    rangeId: number,
    shooter: InternalShooter | null,
    discipline: InternalDiscipline | null,
    startListId: number | null,
    hits: Hits,
    source: Source,
    ttl: number,
}

export const isInternalRange = createIs<InternalRange>();

export type InternalShooter = InternalShooterById | InternalShooterByName;

export const isInternalShooterById = createIs<InternalShooterById>();
export const isInternalShooterByName = createIs<InternalShooterByName>();

export type InternalShooterById = number;

export type InternalShooterByName = {
    firstName: string,
    lastName: string,
}

export type InternalDiscipline = InternalOverrideDiscipline | NormInternalDiscipline;

export const isInternalOverrideDiscipline = createIs<InternalOverrideDiscipline>();
export const isNormInternalDiscipline = createIs<NormInternalDiscipline>();

type BaseInternalDiscipline = {
    roundId: number,
}

type InternalOverrideDiscipline = BaseInternalDiscipline & {
    overrideId: number,
}

type NormInternalDiscipline = BaseInternalDiscipline & {
    disciplineId: number,
}