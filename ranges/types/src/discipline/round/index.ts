export type Zoom = ZoomFixed | ZoomBase;

type ZoomFixed = {
    mode: "fixed",
    value: number,
}

type ZoomBase = {
    mode: "auto" | "none",
}

export type Mode = ModeBase | ModeDecimals | ModeTarget;

type ModeDecimals = {
    mode: "rings" | "divider" | "ringsDiv",
    decimals: number
}

type ModeBase = {
    mode: "circle" | "fullHidden" | "hidden" | "hundred" | "decimal"
}

type ModeTarget = {
    mode: "target"
    decimals: number,
    value: number,
    exact: boolean
}

export type Rounds = Array<Round | null>;

export type Round = {
    id: number;
    name: string;

    mode: Mode;
    maxHits: number;
    counts: boolean;

    zoom: Zoom;
    layoutId: number;
    hitsPerSum: number;
    hitsPerView: number;

}
