import { createIs } from "typia"

export type InternalStartList = {
    id: number,
    name: string,
    active: boolean
    type: "default" | "league" | "round" | "final" | "price"
}

export type OverrideDiscipline = {
    id: number,
    disciplineId: number,
    name: string,
    color: string,
    startListId: number
}

export const isOverrideDiscipline = createIs<OverrideDiscipline>();

export const isInternalStartList = createIs<InternalStartList>();