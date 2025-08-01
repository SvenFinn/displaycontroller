export type StartList = {
    id: number;
    name: string;
    type: "default" | "price" | "league" | "round" | "final";
}

export function isStartList(startList: any): startList is StartList {
    if (typeof startList !== "object") return false;
    if (typeof startList.id !== "number") return false;
    if (typeof startList.name !== "string") return false;
    if (typeof (startList.type) !== "string") return false;
    return true;
}