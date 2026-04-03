import { tags } from "typia";
import { Index, UnsignedNumber } from "../index.js";

export type HitIndex = Index & tags.Maximum<1000>;

export type Hits = Array<Hit>;

export type Hit = InvalidHit | ValidHit;

export type BaseHit = {
    id: HitIndex;
    valid: boolean;
}

export type InvalidHit = BaseHit & {
    valid: false; // Always false for invalid hits
}

export type ValidHit = BaseHit & {
    valid: true; // Always true for valid hits
    x: number;
    y: number;
    divisor: UnsignedNumber;
    rings: UnsignedNumber;
    innerTen: boolean;
}