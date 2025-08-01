import { TTLHandler } from "dc-ranges-ttl";
import { ActiveRange, InactiveRange, Source } from "@shared/ranges";
import { InternalRange } from "@shared/ranges/internal";
import { Discipline } from "@shared/ranges/discipline";
import { getDiscipline } from "../cache/disciplines";
import { Shooter } from "@shared/ranges/shooter";
import { getShooter } from "../cache/shooters";
import { StartList } from "@shared/ranges/startList";
import { getStartList } from "../cache/startLists";
import { Hit, Hits } from "@shared/ranges/hits";

type SourceData = Array<TTLHandler<InternalRange>>;

function getFirstNotNull<T>(array: T[]): T | null {
    for (const item of array) {
        if (item != null && item !== undefined) {
            return item;
        }
    }
    return null;
}

function mergeDiscipline(sourceData: SourceData): Discipline | null {
    const disciplines = sourceData.map((source) => source.getMessage()?.discipline);
    return getDiscipline(getFirstNotNull(disciplines) || null);
}

function mergeShooter(sourceData: SourceData): Shooter | null {
    const shooters = sourceData.map((source) => source.getMessage()?.shooter);
    return getShooter(getFirstNotNull(shooters) || null);
}

function mergeStartList(sourceData: SourceData): StartList | null {
    const startLists = sourceData.map((source) => source.getMessage()?.startListId);
    return getStartList(getFirstNotNull(startLists) || null);
}

function getMaxRounds(sourceData: SourceData): number {
    let maxRound = 0;
    for (const source of sourceData) {
        if (source.getMessage()) {
            maxRound = Math.max(maxRound, source.getMessage()?.hits.length || 0);
        }
    }
    return maxRound;
}

function mergeRound(sourceData: SourceData, roundId: number): Array<Hit> | null {
    const rounds = sourceData.map((source) => source.getMessage()?.hits[roundId])
        .filter((round) => round !== undefined && round !== null);
    return rounds[0] || null;
}

function mergeHits(sourceData: SourceData): Hits {
    const maxRounds = getMaxRounds(sourceData);
    const hits = [];
    for (let i = 0; i < maxRounds; i++) {
        const round = mergeRound(sourceData, i);
        hits[i] = round;
    }
    return hits;
}

function mergeRoundId(sourceData: SourceData): number {
    return getFirstNotNull(sourceData.map((source) => source.getMessage()?.discipline?.roundId)) || 0;
}

function mergeSource(sourceData: SourceData): Source | null {
    const sources = sourceData.map((source) => source.getMessage()?.source);
    return getFirstNotNull(sources) || null;
}

function mergeActiveRange(sourceData: SourceData, rangeId: number): ActiveRange {
    return {
        id: rangeId,
        active: true,
        shooter: mergeShooter(sourceData),
        discipline: mergeDiscipline(sourceData),
        hits: mergeHits(sourceData),
        round: mergeRoundId(sourceData),
        startList: mergeStartList(sourceData),
        source: mergeSource(sourceData),
    }
}

function mergeInactiveRange(rangeId: number): InactiveRange {
    return {
        id: rangeId,
        active: false
    }
}

export function mergeRange(sourceData: SourceData, rangeId: number): ActiveRange | InactiveRange {
    if (sourceData.some((source) => source.getMessage())) {
        return mergeActiveRange(sourceData, rangeId);
    }
    return mergeInactiveRange(rangeId);
}