import { Rounds } from './round';
import { Layouts } from './layout';
import { createIs } from "typia";

export type Discipline = {
    id: number;

    name: string;
    color: string;
    gauge: number;

    rounds: Rounds;
    layouts: Layouts;

}

export const isDiscipline = createIs<Discipline>();