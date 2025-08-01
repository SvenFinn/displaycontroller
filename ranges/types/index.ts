import { Shooter, isShooter } from './shooter';
import { StartList, isStartList } from './startList';
import { Discipline, isDiscipline } from './discipline';
import { Hits, isHits } from './hits';


type BaseRange = {
    id: number;
}

function isBaseRange(range: any): range is BaseRange {
    return typeof range.id === "number";
}

export type InactiveRange = BaseRange & {
    active: false;
}

export function isInactiveRange(range: any): range is InactiveRange {
    if (!isBaseRange(range)) return false;
    const rangeWType = range as InactiveRange;
    return typeof rangeWType.active === "boolean" && !rangeWType.active;
}

export type ActiveRange = BaseRange & {
    active: true;
    // targetId: number;
    round: number;

    shooter: Shooter | null;
    startList: StartList | null;
    discipline: Discipline | null;
    hits: Hits | null;
    source: Source | null;
}

export function isActiveRange(range: any): range is ActiveRange {
    if (!isBaseRange(range)) return false;
    const rangeWType = range as ActiveRange;
    if (typeof rangeWType.active !== "boolean" || !rangeWType.active) return false;
    if (typeof rangeWType.round !== "number") return false;
    if (rangeWType.shooter !== null && !isShooter(rangeWType.shooter)) return false;
    if (rangeWType.startList !== null && !isStartList(rangeWType.startList)) return false;
    if (rangeWType.discipline !== null && !isDiscipline(rangeWType.discipline)) return false;
    if (rangeWType.hits !== null && !isHits(rangeWType.hits)) return false;
    if (rangeWType.source !== null && !isSource(rangeWType.source)) return false;
    return true;
}

export type Range = InactiveRange | ActiveRange;

export function isRange(range: any): range is Range {
    return isInactiveRange(range) || isActiveRange(range);
}

export type Source = "multicast" | "log" | "ssmdb2";

export function isSource(source: any): source is Source {
    return source === "multicast" || source === "log" || source === "ssmdb2";
}