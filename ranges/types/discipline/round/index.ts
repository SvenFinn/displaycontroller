import { Mode, isMode } from './mode';
import { Zoom, isZoom } from './zoom';

export type Rounds = Array<Round | null>;

export function isRounds(rounds: any): rounds is Rounds {
    if (!Array.isArray(rounds)) return false;
    for (const round of rounds) {
        if (round === null) continue;
        if (!isRound(round)) return false;
    }
    return true;
}

export type Round = {
    id: number;
    name: string;

    mode: Mode;
    maxHits: number;
    counts: boolean;

    zoom: Zoom;
    layoutId: number;
    hitsPerSum: number;
    hitsPerView: number;

}

export function isRound(round: any): round is Round {
    if (typeof (round) !== "object") return false;
    if (typeof (round.id) !== "number") return false;
    if (typeof (round.name) !== "string") return false;
    if (!isMode(round.mode)) return false;
    if (typeof (round.maxHits) !== "number") return false;
    if (typeof (round.counts) !== "boolean") return false;
    if (!isZoom(round.zoom)) return false;
    if (typeof (round.layoutId) !== "number") return false;
    if (typeof (round.hitsPerSum) !== "number") return false;
    if (typeof (round.hitsPerView) !== "number") return false;
    return true;
}