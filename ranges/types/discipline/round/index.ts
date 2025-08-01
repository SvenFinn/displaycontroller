import { DisciplineRoundMode, isDisciplineRoundMode } from './mode';
import { DisciplineRoundZoom, isDisciplineRoundZoom } from './zoom';

export type DisciplineRounds = Array<DisciplineRound | null>;

export function isDisciplineRounds(disciplineRounds: any): disciplineRounds is DisciplineRounds {
    if (!Array.isArray(disciplineRounds)) return false;
    for (const disciplineRound of disciplineRounds) {
        if (disciplineRound === null) continue;
        if (!isDisciplineRound(disciplineRound)) return false;
    }
    return true;
}

export type DisciplineRound = {
    id: number;
    name: string;

    mode: DisciplineRoundMode;
    maxHits: number;
    counts: boolean;

    zoom: DisciplineRoundZoom;
    layoutId: number;
    hitsPerSum: number;
    hitsPerView: number;

}

export function isDisciplineRound(disciplineRound: any): disciplineRound is DisciplineRound {
    if (typeof (disciplineRound) !== "object") return false;
    if (typeof (disciplineRound.id) !== "number") return false;
    if (typeof (disciplineRound.name) !== "string") return false;
    if (!isDisciplineRoundMode(disciplineRound.mode)) return false;
    if (typeof (disciplineRound.maxHits) !== "number") return false;
    if (typeof (disciplineRound.counts) !== "boolean") return false;
    if (!isDisciplineRoundZoom(disciplineRound.zoom)) return false;
    if (typeof (disciplineRound.layoutId) !== "number") return false;
    if (typeof (disciplineRound.hitsPerSum) !== "number") return false;
    if (typeof (disciplineRound.hitsPerView) !== "number") return false;
    return true;
}