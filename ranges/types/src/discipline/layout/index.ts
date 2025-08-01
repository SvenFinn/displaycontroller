export type LayoutRectangle = {
    mode: "rectangle";
    x: number;
    y: number;
    width: number;
    height: number;
}

export type LayoutRings = {
    mode: "rings";
    rings: LayoutRing[];
}

export type LayoutRing = {
    value: number;
    diameter: number;
    colored: boolean;
}

export type LayoutGames = LayoutGamesCommon | LayoutChess | LayoutEaster;

export type LayoutGamesCommon = {
    mode: "dart" | "stars"
    type: "rifle" | "pistol";
}

export type LayoutChess = {
    mode: "chess";
    type: "rifle" | "pistol";
    size: number;
}

export type LayoutEaster = {
    mode: "easter";
}

export type Layouts = {
    [layoutId: number]: Layout;
}

export type Layout = LayoutRings | LayoutGames | LayoutRectangle;


