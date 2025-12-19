import { Index, UnsignedInteger } from "../../common/index.js";
import { Layout } from "./layout.js";
import { Mode } from "./mode.js";
import { Zoom } from "./zoom.js";

export type Rounds = Array<Round | null>;

export type Round = {
    id: Index;
    name: string;

    mode: Mode;
    maxHits: UnsignedInteger;
    counts: boolean;

    zoom: Zoom;
    layout: Layout | null;
    hitsPerSum: UnsignedInteger;
    hitsPerView: UnsignedInteger;

}
