import { Discipline, isDiscipline } from './discipline/index.js';
import { Hits, Hit } from './hits/index.js';
import { isInternalStartList } from './internal/startList/index.js';
import { mergeMaps } from './cache.js';
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
    type: "default" | "price" | "league" | "round" | "final" | "unknown";
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
    LayoutGames,
    LayoutGamesCommon,
    LayoutRectangle,
    LayoutRings,
    LayoutChess,
    LayoutRing,
    LayoutEaster
} from './discipline/layout.js';

export {
    Round,
    Rounds,
    Mode,
    Zoom
} from './discipline/round.js';

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
} from './internal/index.js';

export {
    isOverrideDiscipline,
    OverrideDiscipline,
    InternalStartList
} from './internal/startList/index.js';



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