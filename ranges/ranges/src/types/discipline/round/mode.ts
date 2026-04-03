import { UnsignedInteger, UnsignedNumber } from "../../index.js";

export type Mode = ModeBase | ModeDecimals | ModeTarget;

type ModeDecimals = {
    mode: "rings" | "divider" | "ringsDiv",
    decimals: UnsignedInteger
}

type ModeBase = {
    mode: "circle" | "fullHidden" | "hidden" | "hundred" | "decimal" | "integerDecimal",
}

type ModeTarget = {
    mode: "target"
    decimals: UnsignedInteger,
    value: UnsignedNumber,
    exact: boolean
}