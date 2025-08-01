import { Rounds, isRounds } from './round';
import { Layouts, isLayouts } from './layout';

export type Discipline = {
    id: number;

    name: string;
    color: string;
    gauge: number;

    rounds: Rounds;
    layouts: Layouts;

}

export function isDiscipline(discipline: any): discipline is Discipline {
    if (typeof (discipline) !== "object") return false;
    if (typeof (discipline.id) !== "number") return false;
    if (typeof (discipline.name) !== "string") return false;
    if (typeof (discipline.color) !== "string") return false;
    if (typeof (discipline.gauge) !== "number") return false;
    if (!isRounds(discipline.rounds)) return false;
    if (!isLayouts(discipline.layouts)) return false;
    return true;
}
