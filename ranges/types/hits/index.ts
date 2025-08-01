export type Hits = Array<Array<Hit> | null>;

export function isHits(hits: any): hits is Hits {
    for (const roundId in hits) {
        if (hits[roundId] === null) continue;
        if (!Array.isArray(hits[roundId])) return false;
        for (const hit of hits[roundId]) {
            if (!isHit(hit)) return false;
        }
    }
    return true;
}

export type Hit = InvalidHit | ValidHit;

export function isHit(hit: any): hit is Hit {
    return isInvalidHit(hit) || isValidHit(hit);
}

export type InvalidHit = {
    id: number;
    valid: false; // Always false for invalid hits
}

export function isInvalidHit(hit: any): hit is InvalidHit {
    if (typeof hit !== "object") return false;
    if (typeof hit.id !== "number") return false;
    if (typeof hit.valid !== "boolean") return false;
    if (hit.valid !== false) return false; // Must be false for invalid hits
    return true;
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

export function isValidHit(hit: any): hit is ValidHit {
    if (typeof hit !== "object") return false;
    if (typeof hit.id !== "number") return false;
    if (typeof hit.valid !== "boolean") return false;
    if (hit.valid !== true) return false; // Must be true for valid hits
    if (typeof hit.x !== "number") return false;
    if (typeof hit.y !== "number") return false;
    if (typeof hit.divisor !== "number") return false;
    if (typeof hit.rings !== "number") return false;
    if (typeof hit.innerTen !== "boolean") return false;
    return true;
}