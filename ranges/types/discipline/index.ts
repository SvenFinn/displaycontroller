import { DisciplineRounds, isDisciplineRounds } from './round';
import { DisciplineLayouts, isDisciplineLayouts } from './layout';

export type Discipline = {
    id: number;

    name: string;
    color: string;
    gauge: number;

    rounds: DisciplineRounds;
    layouts: DisciplineLayouts;

}

export function isDiscipline(discipline: any): discipline is Discipline {
    if (typeof (discipline) !== "object") return false;
    if (typeof (discipline.id) !== "number") return false;
    if (typeof (discipline.name) !== "string") return false;
    if (typeof (discipline.color) !== "string") return false;
    if (typeof (discipline.gauge) !== "number") return false;
    if (!isDisciplineRounds(discipline.rounds)) return false;
    if (!isDisciplineLayouts(discipline.layouts)) return false;
    return true;
}
