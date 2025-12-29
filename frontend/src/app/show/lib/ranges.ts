import { Range, Round, Hit, UnsignedNumber, Hits, ActiveRange, UnsignedInteger, ValidHit } from "dc-ranges-types";
import { floor, round as mRound } from "./math";
import smallestEnclosingCircle from "smallest-enclosing-circle";

export function getRoundName(data: Range, roundId?: number): string | null {
    if (!data.active) return null;
    if (!data.discipline) return "Unbekannt";
    if (!roundId) roundId = data.round;
    const round = data.discipline.rounds[roundId];
    if (!round) return "Unbekannt";
    return round.name;
}

type BaseHitEval = {
    id: UnsignedInteger
    kind: string
}

type RingsTargetHiddenHitEval = BaseHitEval & {
    kind: "rings"
    rings: string
}

type DividerHitEval = BaseHitEval & {
    divider: UnsignedNumber
    kind: "divider"
}

type HundredHitEval = BaseHitEval & {
    hundred: UnsignedInteger
    kind: "hundred"
}

type CircleHitEval = BaseHitEval & {
    x: number,
    y: number
    kind: "circle"
}

type HiddenHitEval = BaseHitEval & {
    kind: "hidden"
}

type DecimalHitEval = BaseHitEval & {
    decimal: UnsignedInteger
    rings: string,
    kind: "decimal"
}

type IntegerTimesDecimalHitEval = BaseHitEval & {
    integerTimesDecimal: UnsignedInteger
    rings: string,
    kind: "integerDecimal"
}

type RingsDivHitEval = BaseHitEval & {
    kind: "ringsDiv",
    rings: string,
    divider: UnsignedNumber,
};

export type HitEval = RingsTargetHiddenHitEval | DividerHitEval | HundredHitEval | CircleHitEval | DecimalHitEval | IntegerTimesDecimalHitEval | RingsDivHitEval | HiddenHitEval;

function getRingsEval(hit: ValidHit): RingsTargetHiddenHitEval {
    return {
        kind: "rings",
        id: hit.id,
        rings: `${floor(hit.rings, 1).toFixed(1)}${hit.innerTen ? '*' : ''}`
    };
}

function getDividerEval(decimals: UnsignedInteger, hit: ValidHit): DividerHitEval {
    return {
        kind: "divider",
        id: hit.id,
        divider: floor(hit.divisor, decimals)
    };
}


export function getHitEval(round: Round, hit?: ValidHit): HitEval | null {
    if (!hit) return null;

    switch (round.mode.mode) {
        case "rings":
        case "target":
            return getRingsEval(hit);

        case "ringsDiv":
            return {
                ...getRingsEval(hit),
                ...getDividerEval(0, hit),
                kind: "ringsDiv",

            };

        case "divider":
            return getDividerEval(round.mode.decimals, hit);

        case "fullHidden":
        case "hidden":
            if (round.counts == false) {
                return getRingsEval(hit);
            } else {
                return {
                    kind: "hidden",
                    id: hit.id,
                }
            }

        case "hundred":
            return {
                kind: "hundred",
                id: hit.id,
                hundred: Math.floor((floor(hit.rings, 1) - 1) * 10 + 1)
            }

        case "decimal":
            return {
                ...getRingsEval(hit),
                kind: "decimal",
                decimal: Math.floor(hit.rings * 10) % 10
            }

        case "integerDecimal":
            const integer = Math.floor(hit.rings);
            const decimal = Math.round((hit.rings - integer) * 10);
            return {
                ...getRingsEval(hit),
                kind: "integerDecimal",
                integerTimesDecimal: integer * decimal
            }

        case "circle":
            const precision = 2;
            return {
                kind: "circle",
                id: hit.id,
                x: mRound(hit.x, precision),
                y: mRound(hit.y, precision)
            }

        default:
            return null;
    }
}

export function getSeries(round: Round | null, gauge: UnsignedNumber, hits: Hits): Array<string> {
    if (!round) return [];

    const series = [];
    for (let i = 0; i < hits.length; i += round.hitsPerSum) {
        const seriesHits = hits.slice(i, i + round.hitsPerSum);
        series.push(accumulateHits(seriesHits, round, gauge, false));
    }
    return series;
}

export function getTotal(round: Round | null, gauge: UnsignedNumber, hits: Hits): string {
    if (!round) return "0";
    return accumulateHits(hits, round, gauge, true);
}

function accumulateHits(hits: Hits, round: Round, gauge: UnsignedNumber, isTotal: boolean): string {
    const validHits = hits.filter((hit) => hit.valid);
    if (!validHits.length) {
        return "0";
    }
    switch (round.mode.mode) {
        case "circle":
            const radius = smallestEnclosingCircle(validHits).r;
            return mRound((isNaN(radius) ? 0 : radius * 2) + gauge, 1).toFixed(1);

        case "divider":
            const divider = Math.min(...validHits.map((hit) => hit.divisor));
            return `${floor(divider, round.mode.decimals).toFixed(round.mode.decimals)} (${validHits.find((hit) => hit.divisor == divider)?.id})`;

        case "fullHidden":
        case "hidden":
            if (round.counts) return "***";
            return validHits.reduce((sum, hit) => sum + floor(hit.rings, 0), 0).toFixed(0);

        case "rings":
        case "ringsDiv":
            const decimals = round.mode.decimals;
            return validHits.reduce((sum, hit) => sum + floor(hit.rings, decimals), 0).toFixed(decimals);

        case "hundred":
            return validHits.reduce((sum, hit) => sum + (Math.floor(hit.rings) - 1) * 10 + 1, 0).toFixed(0);

        case "decimal":
            return validHits.reduce((sum, hit) => sum + Math.floor(hit.rings * 10) % 10, 0).toFixed(0);

        case "integerDecimal":
            return validHits.reduce((sum, hit) => {
                const integer = Math.floor(hit.rings);
                const decimal = Math.floor((hit.rings - integer) * 10);
                return sum + integer * decimal;
            }, 0).toFixed(0);

        case "target":
            const tDecimals = round.mode.decimals;
            const exact = round.mode.exact;
            const targetValue = round.mode.value;
            const sum = validHits.reduce((sum, hit) => {
                const value = floor(hit.rings, tDecimals);
                if (!exact || sum + value <= targetValue) {
                    return sum + value;
                } else {
                    return sum;
                }
            }, 0);
            if (isTotal) {
                const result = round.mode.value - sum;
                if (result < 0) return "0";
                return result.toFixed(round.mode.decimals);
            } else {
                return sum.toFixed(round.mode.decimals);
            }

        default:
            return "???";
    }

}

