import { Index, UnsignedInteger, UnsignedNumber } from "dc-ranges/types"

export type BaseHitEval = {
    id: Index
    kind: string
}

export type RingsTargetHiddenHitEval = BaseHitEval & {
    kind: "rings"
    rings: string
}

export type DividerHitEval = BaseHitEval & {
    divider: UnsignedNumber
    kind: "divider"
}

export type HundredHitEval = BaseHitEval & {
    hundred: UnsignedInteger
    kind: "hundred"
}

export type CircleHitEval = BaseHitEval & {
    x: number,
    y: number
    kind: "circle"
}

export type HiddenHitEval = BaseHitEval & {
    kind: "hidden"
}

export type DecimalHitEval = BaseHitEval & {
    decimal: UnsignedInteger
    rings: string,
    kind: "decimal"
}

export type IntegerTimesDecimalHitEval = BaseHitEval & {
    integerTimesDecimal: UnsignedInteger
    rings: string,
    kind: "integerDecimal"
}

export type RingsDivHitEval = BaseHitEval & {
    kind: "ringsDiv",
    rings: string,
    divider: UnsignedNumber,
};

export type HitEval = RingsTargetHiddenHitEval | DividerHitEval | HundredHitEval | CircleHitEval | DecimalHitEval | IntegerTimesDecimalHitEval | RingsDivHitEval | HiddenHitEval;
