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

export type Hit = {
    id: number;
    x: number;
    y: number;
    divisor: number;
    rings: number;
    innerTen: boolean;
}

export function isHit(hit: any): hit is Hit {
    if (typeof hit !== "object") return false;
    if (typeof hit.id !== "number") return false;
    if (typeof hit.x !== "number") return false;
    if (typeof hit.y !== "number") return false;
    if (typeof hit.divisor !== "number") return false;
    if (typeof hit.rings !== "number") return false;
    if (typeof hit.innerTen !== "boolean") return false;
    return true;
}