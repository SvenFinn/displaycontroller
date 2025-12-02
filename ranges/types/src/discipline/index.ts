import { Rounds } from './round';
import { createIs } from "typia";

export type Discipline = {
    id: number;

    name: string;
    color: string;
    gauge: number;

    rounds: Rounds;

}

export const isDiscipline = createIs<Discipline>();