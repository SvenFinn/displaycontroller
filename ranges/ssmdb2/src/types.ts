import { InternalRange, UnsignedInteger } from "dc-ranges-types";

export type SSMDB2InternalRange = InternalRange & {
    targetId: UnsignedInteger;
};
