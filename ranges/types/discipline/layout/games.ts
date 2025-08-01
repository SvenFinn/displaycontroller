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

export function isLayoutCommon(layout: any): layout is LayoutGamesCommon {
    if (typeof layout !== "object") return false;
    if (Array.isArray(layout)) return false;
    if (layout.mode !== "dart" && layout.mode !== "stars") return false;
    if (layout.type !== "rifle" && layout.type !== "pistol") return false;
    return true;
}

export function isLayoutChess(layout: any): layout is LayoutChess {
    if (typeof layout !== "object") return false;
    if (Array.isArray(layout)) return false;
    if (layout.mode !== "chess") return false;
    if (layout.type !== "rifle" && layout.type !== "pistol") return false;
    if (typeof layout.size !== "number") return false;
    return true;
}

export function isLayoutEaster(layout: any): layout is LayoutEaster {
    if (typeof layout !== "object") return false;
    if (Array.isArray(layout)) return false;
    if (layout.mode !== "easter") return false;
    return true;
}

export function isLayoutGames(layout: any): layout is LayoutGames {
    return isLayoutCommon(layout) || isLayoutChess(layout) || isLayoutEaster(layout);
}