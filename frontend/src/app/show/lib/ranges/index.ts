import { Hits, Index, Integer, Range, Round } from "dc-ranges-types";

export function getRoundName(data: Range, roundId?: Index): string | null {
    if (!data.active) return null;
    if (!data.discipline) return "Unbekannt";
    if (!roundId) roundId = data.round;
    const round = data.discipline.rounds[roundId];
    if (!round) return "Unbekannt";
    return round.name;
}

export function getSeriesId(hitId: Index, hitCount: Integer): Index {
    return Math.floor((hitId - 1) / hitCount);
}

export function getHitsOfSeries(round: Round, hits: Hits, seriesId: Integer): Hits {
    const hitCount = round.hitsPerSum;
    return hits.filter(
        (hit) => getSeriesId(hit.id, hitCount) === seriesId
    );
}

export function getLatestSeriesId(round: Round, hits: Hits): Index {
    if (hits.length === 0) return 0;
    const maxId = Math.max(...hits.map(h => h.id));
    return getSeriesId(maxId, round.hitsPerSum);
}
