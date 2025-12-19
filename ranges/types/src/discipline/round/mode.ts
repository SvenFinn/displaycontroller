import { UnsignedNumber } from "../../common/index.js";

export type Mode = ModeBase | ModeDecimals | ModeTarget;

type ModeDecimals = {
    mode: "rings" | "divider" | "ringsDiv",
    decimals: UnsignedNumber
}

type ModeBase = {
    mode: "circle" | "fullHidden" | "hidden" | "hundred" | "decimal" | "integerDecimal",
}

type ModeTarget = {
    mode: "target"
    decimals: UnsignedNumber,
    value: UnsignedNumber,
    exact: boolean
}