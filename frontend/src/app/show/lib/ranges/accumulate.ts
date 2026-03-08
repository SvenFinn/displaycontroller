import { Hits, Round, UnsignedNumber } from "dc-ranges-types";
import smallestEnclosingCircle from "smallest-enclosing-circle";
import { floor, round as mRound } from "../math";
import { getHitsOfSeries, getLatestSeriesId } from ".";
import { getHitEval } from "./eval";

export function getSeries(round: Round | null, gauge: UnsignedNumber, hits: Hits): Array<string> {
    if (!round) return [];
    if (hits.length == 0) return [];

    const series = [];
    const maxSeriesId = getLatestSeriesId(round, hits);
    for (let i = 0; i <= maxSeriesId; i++) {
        const seriesHits = getHitsOfSeries(round, hits, i);
        series.push(accumulateHits(seriesHits, round, gauge, false));
    }
    return series;
}

export function getExtrapolated(round: Round | null, hits: Hits): string | null {
    // This does not use the same extrapolation method as the ShootMaster system,
    // but it provides a reasonable estimate.

    const MIN_HITS_FOR_EXTRAPOLATION = 8;

    if (!round) return null;
    if (!round.counts) return null;

    const mode = round.mode.mode;
    if (mode != "rings" && mode != "ringsDiv" && mode != "hundred" && mode != "decimal" && mode != "integerDecimal") return null;

    if (hits.length == 0) return null;
    if (hits.length >= round.maxHits) return null;

    const validHits = hits.filter((hit) => hit.valid);
    if (validHits.length < MIN_HITS_FOR_EXTRAPOLATION) {
        return null;
    }

    let hitValues: number[] = [];
    let decimals: number = 0;
    switch (round.mode.mode) {
        case "rings":
        case "ringsDiv":
            decimals = round.mode.decimals;
            hitValues = validHits.map((hit) => floor(hit.rings, decimals));
            break;
        case "hundred":
            decimals = 0;
            hitValues = validHits.map((hit) => Math.floor(hit.rings) * 10);
            break;
        case "decimal":
            decimals = 0;
            hitValues = validHits.map((hit) => Math.floor(hit.rings * 10) % 10);
            break;
        case "integerDecimal":
            decimals = 0;
            hitValues = validHits.map((hit) => {
                const integer = Math.floor(hit.rings);
                const decimal = Math.floor((hit.rings - integer) * 10);
                return integer * decimal;
            });
            break;
        default:
            return null;
    }

    const sum = hitValues.reduce((sum, value) => sum + value, 0);

    const average = sum / hitValues.length;

    const extrapolatedValue = sum + average * (round.maxHits - hits.length);

    return mRound(extrapolatedValue, decimals || 0).toFixed(decimals || 0);
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