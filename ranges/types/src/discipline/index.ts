import { ColorCode, Index, UnsignedNumber } from '../common/index.js';
import { Rounds } from './round/index.js';
import { createIs } from "typia";

export type Discipline = {
    id: Index;

    name: string;
    color: ColorCode;
    gauge: UnsignedNumber;

    rounds: Rounds;
}

export type OverrideDiscipline = {
    id: Index,
    disciplineId: Index,
    name: string,
    color: ColorCode,
    startListId: Index
}

export type InternalDiscipline = InternalOverrideDiscipline | NormInternalDiscipline;

type BaseInternalDiscipline = {
    roundId: Index,
}

export type InternalOverrideDiscipline = BaseInternalDiscipline & {
    overrideId: Index,
}

export type NormInternalDiscipline = BaseInternalDiscipline & {
    disciplineId: Index,
}
