export type Hits = Array<Array<Hit> | null>;

export type Hit = InvalidHit | ValidHit;

export type InvalidHit = {
    id: number;
    valid: false; // Always false for invalid hits
}

export type ValidHit = {
    id: number;
    valid: true; // Always true for valid hits
    x: number;
    y: number;
    divisor: number;
    rings: number;
    innerTen: boolean;
}