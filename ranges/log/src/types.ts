import { Hit, Index, InternalRange, RangeId } from "dc-ranges-types"
import { createIs } from "typia"

export type LogMessage = LogLine | {
    action: "reset",
}

export type LogLine = {
    action: "insert" | "delete",
    rangeId: RangeId,
    targetId: number,
    shooter: {
        name: string,
        id: Index,
        team: string,
        club: string,
        class: {
            name: string,
            id: Index,
        },
    },
    discipline: {
        name: string,
        id: Index,
    },
    round: {
        name: string,
        id: Index,
    },
    hit: Hit,
    timestamp: Date,
}

export const isLogLine = createIs<LogLine>()

export type LogInternalRange = InternalRange & {
    targetId: number
    last_update: Date
}

export type MulticastInternalRange = InternalRange & {
    onRangeSince: Date
}