import { Hit, Index, InternalDiscipline, InternalRange, RangeId } from "dc-ranges/types"
import { createIs } from "typia"

export type ResetAction = {
    action: "reset",
}

export type RawLogLine = {
    action: "line",
    parts: string[],
}

export type RawLogMessage = ResetAction | RawLogLine

export type LogMessage = LogLine | ResetAction

export type LogLine = {
    action: "insert" | "delete",
    rangeId: RangeId,
    targetId: string,
    shooterId: Index
    discipline: InternalDiscipline
    hit: Hit,
    timestamp: Date,
}

export const isLogLine = createIs<LogLine>()

export type LogInternalRange = InternalRange & {
    targetId: string
    last_update: Date
    source: "log"
}

export type MulticastInternalRange = InternalRange & {
    onRangeSince: Date
    source: "multicast"
}