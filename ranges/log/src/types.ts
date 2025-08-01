import { InternalRange } from "@shared/ranges/internal"

export type LogMessage = LogLine | {
    action: "reset",
}

export type LogLine = {
    action: "insert" | "delete",
    rangeId: number,
    targetId: number,
    shooter: {
        name: string,
        id: number,
        team: string,
        club: string,
        class: {
            name: string,
            id: number,
        },
    },
    discipline: {
        name: string,
        id: number,
    },
    round: {
        name: string,
        id: number,
    },
    hit: {
        id: number,
        x: number,
        y: number,
        divisor: number,
        innerRing: boolean,
        rings: number,
    },
    timestamp: Date,

}

export type LogInternalRange = InternalRange & {
    targetId: number
    last_update: Date
}

export type MulticastInternalRange = InternalRange & {
    onRangeSince: Date
}