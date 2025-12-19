import { Index } from "../common/index.js"

export type StartListTypes = "default" | "league" | "round" | "final" | "price" | "unknown";

export type InternalStartList = {
    id: Index,
    name: string,
    active: boolean
    type: StartListTypes
}

export type StartList = {
    id: Index;
    name: string;
    type: StartListTypes;
}