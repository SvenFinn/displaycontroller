import { Discipline, InternalDiscipline, InternalOverrideDiscipline, NormInternalDiscipline, OverrideDiscipline } from './discipline/index.js';
import { Hits, Hit, ValidHit } from './hits/index.js';
import { createIs, tags } from 'typia';
import { Layout, LayoutChess, LayoutDart, LayoutEaster, LayoutRectangle, LayoutRing, LayoutRings, LayoutStars } from './discipline/round/layout.js';
import { Round, Rounds } from './discipline/round/index.js';
import { Mode } from './discipline/round/mode.js';
import { Zoom } from './discipline/round/zoom.js';
import { InternalShooter, InternalShooterByName, RangeShooter, Shooter } from './shooter/index.js';
import { StartList } from './startList/index.js';

export type Integer = number & tags.MultipleOf<1>;
export type UnsignedNumber = number & tags.Minimum<0>;
export type UnsignedInteger = Integer & UnsignedNumber;

export type RangeId = Integer & tags.Minimum<1> & tags.Maximum<416>;
export type Index = UnsignedInteger;

export const isIndex = createIs<Index>();

export type ColorCode = string & tags.MinLength<7> & tags.MaxLength<7>;


export type Range = InactiveRange | ActiveRange;

type BaseRange = {
    id: number;
}

export type InactiveRange = BaseRange & {
    active: false;
}

export type ActiveRange = BaseRange & {
    active: true;
    // targetId: number;
    round: number;

    shooter: RangeShooter | null;
    startList: StartList | null;
    discipline: Discipline | null;
    hits: Array<Hits>;
    ipAddress: string | null;
    source: Source;
}

export type InternalRange = {
    rangeId: RangeId,
    shooter: InternalShooter | null,
    discipline: InternalDiscipline | null,
    startListId: Index | null,
    hits: Array<Hits>,
    source: Source,
    ttl: UnsignedInteger,
}


export const isRange = createIs<Range>();

export type Source = "multicast" | "log" | "ssmdb2";

export const isDiscipline = createIs<Discipline>();
export const isStartList = createIs<StartList>();
export const isOverrideDiscipline = createIs<OverrideDiscipline>();
export const isShooter = createIs<Shooter>();
export const isInternalShooterByName = createIs<InternalShooterByName>();
export const isInternalShooter = createIs<InternalShooter>();
export const isInternalOverrideDiscipline = createIs<InternalOverrideDiscipline>();
export const isNormInternalDiscipline = createIs<NormInternalDiscipline>();
export const isInternalRange = createIs<InternalRange>();

export {
    Discipline,
    Hit,
    ValidHit,
    Hits,
    Layout,
    LayoutChess,
    LayoutDart,
    LayoutEaster,
    LayoutRectangle,
    LayoutRing,
    LayoutRings,
    LayoutStars,
    Mode,
    Round,
    Rounds,
    Zoom,
    InternalDiscipline,
    InternalShooter,
    InternalShooterByName,
    StartList,
    OverrideDiscipline,
    Shooter,
    RangeShooter
}

// The ShootMaster software represents a invalid hit as the maximum 32-bit integer value.
// This is used to detect invalid hits in the log & ssmdb2 streams.
const MAX_32_BIT_INT = 2147483647;
export const INVALID_HIT_POS = [MAX_32_BIT_INT, MAX_32_BIT_INT];
