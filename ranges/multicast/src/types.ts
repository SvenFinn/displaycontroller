import AhoCorasick from "ahocorasick";
import { Index, InternalShooter, RangeId, UnsignedInteger } from "dc-ranges/types";

export type Candidate<T> = {
    readonly start: UnsignedInteger,
    readonly end: UnsignedInteger,
    readonly data: T
    readonly match: string;
}

export type CandidateBaseDiscipline = {
    disciplineId: Index;
    roundId: Index;
}

export type CandidateOverrideDiscipline = CandidateBaseDiscipline & {
    overrideId: Index;
    startListId: Index;
}

export function isOverride(discipline: CandidateDiscipline): discipline is CandidateOverrideDiscipline {
    return "overrideId" in discipline;
}

export type CandidateDiscipline = CandidateBaseDiscipline | CandidateOverrideDiscipline;

export type CandidateStartList = {
    id: Index;
    hasOverrideDisciplines: boolean;
};

export type Matcher<T> = {
    matcher: AhoCorasick;
    candidates: ReadonlyMap<string, T[]>;
}

export type PacketCandidates = {
    id: RangeId;
    disciplineCandidates: Candidate<CandidateDiscipline>[];
    startListCandidates: Candidate<CandidateStartList>[];
    shooterCandidates: Candidate<InternalShooter>[];
}

export type ResolvedPacketCandidates = PacketCandidates & {
    discipline: CandidateDiscipline | null;
    startList: CandidateStartList | null;
    shooter: InternalShooter | null;
}