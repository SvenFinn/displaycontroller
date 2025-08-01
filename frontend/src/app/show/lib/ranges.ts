import { Range } from "@shared/ranges";
import { floor, round as mRound } from "./math";
import { DisciplineRound } from "@shared/ranges/discipline/round";
import { Hit } from "@shared/ranges/hits";
import smallestEnclosingCircle from "smallest-enclosing-circle";

export function getRoundName(data: Range, roundId?: number): string | null {
    if (!data.active) return null;
    if (!data.discipline) return "Unbekannt";
    if (!roundId) roundId = data.round;
    const round = data.discipline.rounds[roundId];
    if (!round) return "Unbekannt";
    return round.name;
}

export function getHitString(data: Range, roundId?: number, index?: number): Array<string> | null {
    if (!data.active) return null;
    if (!data.hits) return null;
    if (!roundId) roundId = data.round;
    const roundHits = data.hits[roundId];
    if (!roundHits) return null;
    if (!index) index = roundHits.length - 1;
    const hit = roundHits[index];
    if (!hit) return null;

    const round = getRound(data, roundId);
    if (!round) return null;

    switch (round.mode.mode) {
        case "rings":
        case "target":
            return [
                `${hit.id}`,
                `${floor(hit.rings, 1).toFixed(1)}${hit.innerTen ? '*' : ''}`]

        case "ringsDiv":
            return [
                `${hit.id}`,
                `${floor(hit.rings, 1).toFixed(1)}${hit.innerTen ? '*' : ''}`,
                `${floor(hit.divisor, 0).toFixed(0)}`
            ]

        case "divider": {
            return [
                `${hit.id}`,
                `${floor(hit.divisor, round.mode.decimals).toFixed(round.mode.decimals)}`
            ];
        }

        case "fullHidden":
        case "hidden":
            if (round.counts == false) {
                return [
                    `${hit.id}`,
                    `${floor(hit.rings, 1).toFixed(1)}`
                ]
            } else {
                return [
                    `${hit.id}`,
                    "***"
                ]
            }

        case "hundred":
            return [
                `${hit.id}`,
                `${Math.floor((floor(hit.rings, 1) - 1) * 10 + 1)}`
            ]

        case "decimal":
            return [
                `${hit.id}`,

                `${Math.floor(hit.rings * 10) % 10}`
            ]

        case "circle":
            return [
                `${hit.id}`,
                `${mRound(hit.x, 2).toFixed(2)}`,
                `${mRound(hit.y, 2).toFixed(2)}`
            ]

        default:
            return null;
    }
}

export function getSeries(data: Range, roundId?: number, hitCount?: number, gauge?: number): Array<string> {
    if (!data.active) return [];
    if (!data.hits) return [];
    if (!data.discipline) return [];
    if (!roundId) roundId = data.round;
    const round = getRound(data, roundId);
    if (!round) return [];
    if (!hitCount) hitCount = round.hitsPerSum;
    const hits = data.hits[roundId];
    if (!hits) return [];
    if (!gauge) gauge = data.discipline.gauge;
    const series = [];
    for (let i = 0; i < hits.length; i += hitCount) {
        series.push(accumulateHits(hits, round, gauge, i, i + hitCount, false));
    }
    return series;
}

export function getTotal(data: Range, roundId?: number, gauge?: number): string {
    if (!data.active) return "";
    if (!data.hits) return "";
    if (!data.discipline) return "";
    if (!roundId) roundId = data.round;
    const round = getRound(data, roundId);
    if (!round) return "";
    const hits = data.hits[roundId];
    if (!hits) return "";
    if (!gauge) gauge = data.discipline.gauge;
    return accumulateHits(hits, round, gauge, 0, hits.length, true);
}

function accumulateHits(hits: Array<Hit>, round: DisciplineRound, gauge: number, startId: number, endId: number, isTotal: boolean): string {
    const hitsToAccumulate = hits.slice(startId, endId);
    let sum = 0;
    if (round.mode.mode == "divider") {
        sum = Infinity;
    }
    let hitId = 0;
    for (const hit of hitsToAccumulate) {
        if (!hit) continue;
        switch (round.mode.mode) {
            case "divider":
                if (hit.divisor < sum) {
                    sum = floor(hit.divisor, round.mode.decimals);
                    hitId = hit.id;
                }
                break;
            case "fullHidden":
            case "hidden":
                if (round.counts) return "***";
                sum += floor(hit.rings, 0);
                break;
            case "rings":
            case "ringsDiv":
                sum += floor(hit.rings, round.mode.decimals);
                break;
            case "hundred":
                sum += (Math.floor(hit.rings) - 1) * 10 + 1;
                break;
            case "decimal":
                sum += Math.floor(hit.rings * 10) % 10;
                break;
            case "circle":
                sum = 0;
                break;
            case "target":
                const value = floor(hit.rings, round.mode.decimals);
                if (!round.mode.exact) {
                    sum += value;
                } else if (sum + value <= round.mode.value) {
                    sum += value;
                }
                break;
            default:
                throw new Error("Unsupported mode");
        }
    }
    switch (round.mode.mode) {
        case "divider":
            if (sum == Infinity) return "";
            return `${sum.toFixed(round.mode.decimals)} (${hitId})`;
        case "rings":
            return `${sum.toFixed(round.mode.decimals)}`;
        case "hidden":
        case "fullHidden":
            if (round.counts) return "***";
            return sum.toFixed(0);
        case "circle":
            const radius = smallestEnclosingCircle(hitsToAccumulate).r;
            return mRound((isNaN(radius) ? 0 : radius * 2) + gauge, 1).toFixed(1);
        case "target":
            if (isTotal) {
                const result = round.mode.value - sum;
                if (result < 0) return "0";
                return result.toFixed(round.mode.decimals);
            } else {
                return sum.toFixed(round.mode.decimals);
            }
        default:
            return sum.toFixed(0);
    }
}

function getRound(data: Range, roundId?: number): DisciplineRound | null {
    if (!data.active) return null;
    if (!data.discipline) return null;
    if (!roundId) roundId = data.round;
    const round = data.discipline.rounds[roundId];
    if (!round) return null;
    return round;
}

