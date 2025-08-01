import { Discipline, isDiscipline } from './discipline';
import { Hits, Hit } from './hits';
import { isOverrideDiscipline, isInternalStartList } from './internal/startList';
import { mergeMaps } from './cache';
import { createIs } from 'typia';

type BaseRange = {
    id: number;
}

export type InactiveRange = BaseRange & {
    active: false;
}

export type Shooter = {
    id: number | null; // Null = Can't be determined uniquely
    firstName: string;
    lastName: string;
}

export const isShooter = createIs<Shooter>();

export type StartList = {
    id: number;
    name: string;
    type: "default" | "price" | "league" | "round" | "final";
}

export type ActiveRange = BaseRange & {
    active: true;
    // targetId: number;
    round: number;

    shooter: Shooter | null;
    startList: StartList | null;
    discipline: Discipline | null;
    hits: Hits | null;
    ipAddress: string | null;
    source: Source;
}

export type Range = InactiveRange | ActiveRange;

export const isRange = createIs<Range>();

export type Source = "multicast" | "log" | "ssmdb2";

export {
    Layout,
    Layouts,
    LayoutGames,
    LayoutGamesCommon,
    LayoutRectangle,
    LayoutRings,
    LayoutChess,
    LayoutRing
} from './discipline/layout';

export {
    Round,
    Rounds,
    Mode,
    Zoom
} from './discipline/round';

export {
    InternalDiscipline,
    InternalShooter,
    InternalShooterById,
    InternalShooterByName,
    isInternalShooterByName,
    isInternalShooterById,
    InternalRange,
    isInternalRange,
    isInternalOverrideDiscipline,
    isNormInternalDiscipline,
} from './internal';

export {
    isOverrideDiscipline,
    OverrideDiscipline,
    InternalStartList
} from './internal/startList';



export {
    Discipline,
    isDiscipline,
    mergeMaps,
    Hit,
    Hits,
    isInternalStartList
}

// The ShootMaster software represents a invalid hit as the maximum 32-bit integer value.
// This is used to detect invalid hits in the log & ssmdb2 streams.
const MAX_32_BIT_INT = 2147483647;
export const INVALID_HIT_POS = [MAX_32_BIT_INT, MAX_32_BIT_INT];