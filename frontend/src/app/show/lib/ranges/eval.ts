import { Round, UnsignedInteger, ValidHit } from "dc-ranges/types";
import { DividerHitEval, HitEval, RingsTargetHiddenHitEval } from "./types";
import { floor, round as mRound } from "../math";

function getRingsEval(hit: ValidHit): RingsTargetHiddenHitEval {
    return {
        kind: "rings",
        id: hit.id,
        rings: `${floor(hit.rings, 1).toFixed(1)}${hit.innerTen ? '*' : ''}`
    };
}

function getDividerEval(decimals: UnsignedInteger, hit: ValidHit): DividerHitEval {
    return {
        kind: "divider",
        id: hit.id,
        divider: floor(hit.divisor, decimals)
    };
}


export function getHitEval(round: Round, hit?: ValidHit): HitEval | null {
    if (!hit) return null;

    switch (round.mode.mode) {
        case "rings":
        case "target":
            return getRingsEval(hit);

        case "ringsDiv":
            return {
                ...getRingsEval(hit),
                ...getDividerEval(0, hit),
                kind: "ringsDiv",

            };

        case "divider":
            return getDividerEval(round.mode.decimals, hit);

        case "fullHidden":
        case "hidden":
            if (round.counts == false) {
                return getRingsEval(hit);
            } else {
                return {
                    kind: "hidden",
                    id: hit.id,
                }
            }

        case "hundred":
            return {
                kind: "hundred",
                id: hit.id,
                hundred: Math.floor((floor(hit.rings, 1) - 1) * 10 + 1)
            }

        case "decimal":
            return {
                ...getRingsEval(hit),
                kind: "decimal",
                decimal: Math.floor(hit.rings * 10) % 10
            }

        case "integerDecimal":
            const integer = Math.floor(hit.rings);
            const decimal = Math.round((hit.rings - integer) * 10);
            return {
                ...getRingsEval(hit),
                kind: "integerDecimal",
                integerTimesDecimal: integer * decimal
            }

        case "circle":
            const precision = 2;
            return {
                kind: "circle",
                id: hit.id,
                x: mRound(hit.x, precision),
                y: mRound(hit.y, precision)
            }

        default:
            return null;
    }
}