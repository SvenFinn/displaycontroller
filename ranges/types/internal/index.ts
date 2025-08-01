import { Hits, isHits } from "../hits";
import { Source, isSource } from "../index";


export type InternalRange = {
    rangeId: number,
    shooter: InternalShooter | null,
    discipline: InternalDiscipline | null,
    startListId: number | null,
    hits: Hits,
    source: Source,
    ttl: number,
}

export function isInternalRange(range: any): range is InternalRange {
    if (typeof range !== "object") return false;
    if (typeof range.rangeId !== "number") return false;
    if (range.shooter !== null && !isInternalShooter(range.shooter)) return false;
    if (range.discipline !== null && !isInternalDiscipline(range.discipline)) return false;
    if (range.startListId !== null && typeof range.startListId !== "number") return false;
    if (!isHits(range.hits)) return false;
    if (!isSource(range.source)) return false;
    if (typeof range.ttl !== "number") return false;
    return true;
}

export type InternalShooter = InternalShooterById | InternalShooterByName;

export function isInternalShooter(shooter: any): shooter is InternalShooter {
    return isInternalShooterById(shooter) || isInternalShooterByName(shooter);
}

export type InternalShooterById = number;

export function isInternalShooterById(shooter: any): shooter is InternalShooterById {
    return typeof shooter === "number";
}

export type InternalShooterByName = {
    firstName: string,
    lastName: string,
}

export function isInternalShooterByName(shooter: any): shooter is InternalShooterByName {
    if (typeof shooter !== "object" || shooter == null) return false;
    if (typeof shooter.firstName !== "string") return false;
    if (typeof shooter.lastName !== "string") return false;
    return true;
}

export type InternalDiscipline = InternalOverrideDiscipline | NormInternalDiscipline;

export function isInternalDiscipline(discipline: any): discipline is InternalDiscipline {
    return isInternalOverrideDiscipline(discipline) || isNormInternalDiscipline(discipline);
}

type BaseInternalDiscipline = {
    roundId: number,
}

function isBaseInternalDiscipline(discipline: any): discipline is BaseInternalDiscipline {
    if (typeof discipline !== "object") return false;
    if (typeof discipline.roundId !== "number") return false;
    return true;
}

type InternalOverrideDiscipline = BaseInternalDiscipline & {
    overrideId: number,
}

export function isInternalOverrideDiscipline(discipline: any): discipline is InternalOverrideDiscipline {
    if (!isBaseInternalDiscipline(discipline)) return false;
    discipline = discipline as InternalOverrideDiscipline;
    if (typeof discipline.overrideId !== "number") return false;
    return true;
}

type NormInternalDiscipline = BaseInternalDiscipline & {
    disciplineId: number,
}

export function isNormInternalDiscipline(discipline: any): discipline is NormInternalDiscipline {
    if (!isBaseInternalDiscipline(discipline)) return false;
    discipline = discipline as NormInternalDiscipline;
    if (typeof discipline.disciplineId !== "number") return false;
    return true;
}