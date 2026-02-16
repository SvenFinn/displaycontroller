import { Hits, Round, UnsignedNumber } from "dc-ranges-types";
import smallestEnclosingCircle from "smallest-enclosing-circle";
import { floor, round as mRound } from "../math";
import { getHitsOfSeries, getLatestSeriesId } from ".";

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