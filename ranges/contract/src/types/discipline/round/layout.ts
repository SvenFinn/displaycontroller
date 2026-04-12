import { UnsignedInteger, UnsignedNumber } from "../../index.js";

export type Layout = LayoutRings | LayoutRectangle | LayoutDart | LayoutStars | LayoutChess | LayoutEaster;

export type LayoutRectangle = {
    mode: "rectangle";
    x: number;
    y: number;
    width: UnsignedNumber;
    height: UnsignedNumber;
}

export type LayoutRings = {
    mode: "rings";
    rings: LayoutRing[];
}

export type LayoutRing = {
    value: UnsignedInteger;
    diameter: UnsignedNumber;
    colored: boolean;
}


export type LayoutDart = {
    mode: "dart";
    type: "rifle" | "pistol";
}

export type LayoutStars = {
    mode: "stars";
    type: "rifle" | "pistol";
}

export type LayoutChess = {
    mode: "chess";
    type: "rifle" | "pistol";
    size: 5 | 6 | 7 | 10;
}

export type LayoutEaster = {
    mode: "easter" | "winter";
}

