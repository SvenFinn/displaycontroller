
export function isInternalStartList(startList: any): startList is InternalStartList {
    if (typeof startList !== "object") return false;
    if (typeof startList.id !== "number") return false;
    if (typeof startList.name !== "string") return false;
    if (typeof (startList.active) !== "boolean") return false;
    if (typeof (startList.type) !== "string") return false;
    if (startList.type !== "price" && startList.type !== "default" && startList.type !== "league" && startList.type !== "round" && startList.type !== "final") {
        return false;
    }
    return true;
}

export type InternalStartList = {
    id: number,
    name: string,
    active: boolean
    type: "default" | "league" | "round" | "final" | "price"
}

export function isOverrideDiscipline(overrideDiscipline: any): overrideDiscipline is OverrideDiscipline {
    if (typeof overrideDiscipline !== "object") return false;
    if (typeof overrideDiscipline.id !== "number") return false;
    if (typeof overrideDiscipline.disciplineId !== "number") return false;
    if (typeof overrideDiscipline.name !== "string") return false;
    if (typeof overrideDiscipline.color !== "string") return false;
    if (typeof overrideDiscipline.startListId !== "number") return false;
    return true;
}

export type OverrideDiscipline = {
    id: number,
    disciplineId: number,
    name: string,
    color: string,
    startListId: number
}