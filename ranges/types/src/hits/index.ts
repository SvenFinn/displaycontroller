import { Index, UnsignedInteger, UnsignedNumber } from "../common/index.js";

export type Hits = Array<Array<Hit>>;

export type Hit = InvalidHit | ValidHit;

export type BaseHit = {
    id: Index;
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