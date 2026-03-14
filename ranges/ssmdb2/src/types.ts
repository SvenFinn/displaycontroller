import { Hits, Index, UnsignedInteger } from "dc-ranges-types";

export type SSMDB2InternalRange = {
    rangeId: Index;
    startListId: Index;
    disciplineId: Index;
    hits: Array<Hits>;
    shooter: Index | null;
    targetId: UnsignedInteger;
};