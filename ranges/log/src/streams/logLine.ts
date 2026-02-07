import { isValid, parse } from "date-fns";
import { Transform } from "node:stream";
import { isLogLine, LogLine, RawLogMessage } from "../types";
import { logger } from "dc-logger";
import { Index, INVALID_HIT_POS, RangeId, ShooterId, UnsignedInteger } from "dc-ranges-types";

const LOG_LINE_PARTS = {
    RANGE_ID: 0,
    DISCIPLINE_ID: 3,
    ROUND_ID: 5,
    SHOOTER_ID: 7,
    HIT_ID: 13,
    TIME: 14,
    DATE: 15,
    RINGS: 16,
    HIT_X: 17,
    HIT_Y: 18,
    DIVISOR: 19,
    TARGET_ID: 26,
    ACTION: 27,
    innerTen: 28,
}
const EXPECTED_COLUMN_COUNT = 30;

export class LogLineStream extends Transform {
    constructor() {
        super({ objectMode: true });
    }

    private transformAction(action: string): "insert" | "delete" {
        if (action === "i") return "insert";
        if (action === "d") return "delete";
        throw new Error(`Unknown action "${action}" in log line.`);
    }

    private intOrThrow(value: string): number {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            throw new Error(`Value "${value}" is not a valid integer.`);
        }
        return parsed;
    }

    private parseDeFloat(value: string): number {
        const normalized = value.replace(/,/g, ".");
        const parsed = parseFloat(normalized);
        if (isNaN(parsed)) {
            throw new Error(`Value "${value}" is not a valid float.`);
        }
        return parsed;
    }

    private parseTimestamp(dateStr: string, timeStr: string): Date {
        const combined = `${dateStr.trim()} ${timeStr.trim()}`;
        const dt = parse(
            combined,
            "d.M.yyyy H:m:s.SSS",
            new Date()
        );

        if (!isValid(dt)) {
            throw new Error(`Invalid timestamp: ${combined}`);
        }

        return dt;
    }

    private createLogLine(parts: string[]): LogLine | null {
        if (parts.length != EXPECTED_COLUMN_COUNT) {
            logger.warn(`Unexpected number of columns in log line. Expected ${EXPECTED_COLUMN_COUNT}, got ${parts.length}. Line: ${parts.join(",")}`);
            return null;
        }

        try {
            const timestamp = this.parseTimestamp(parts[LOG_LINE_PARTS.DATE], parts[LOG_LINE_PARTS.TIME]);
            if (timestamp < (new Date(Date.now() - 24 * 60 * 60 * 1000))) {
                logger.debug(`Skipping log line with old timestamp: ${timestamp.toISOString()}`);
                return null;
            }

            const hitX = this.parseDeFloat(parts[LOG_LINE_PARTS.HIT_X]);
            const hitY = this.parseDeFloat(parts[LOG_LINE_PARTS.HIT_Y]);

            const line: LogLine = {
                action: this.transformAction(parts[LOG_LINE_PARTS.ACTION]),
                rangeId: this.intOrThrow(parts[LOG_LINE_PARTS.RANGE_ID]) as RangeId,
                targetId: parts[LOG_LINE_PARTS.TARGET_ID],
                shooterId: this.intOrThrow(parts[LOG_LINE_PARTS.SHOOTER_ID]) as ShooterId,
                discipline: {
                    disciplineId: this.intOrThrow(parts[LOG_LINE_PARTS.DISCIPLINE_ID]) as Index,
                    roundId: this.intOrThrow(parts[LOG_LINE_PARTS.ROUND_ID]) as Index,
                },
                hit: {
                    id: this.intOrThrow(parts[LOG_LINE_PARTS.HIT_ID]) as UnsignedInteger,
                    x: hitX / 100,
                    y: hitY / 100,
                    divisor: this.intOrThrow(parts[LOG_LINE_PARTS.DIVISOR]) as UnsignedInteger,
                    rings: this.parseDeFloat(parts[LOG_LINE_PARTS.RINGS]),
                    innerTen: parts[LOG_LINE_PARTS.innerTen] === "IZ",
                    valid: hitX < INVALID_HIT_POS[0] && hitY < INVALID_HIT_POS[1],
                },
                timestamp,
            }
            if (!isLogLine(line)) {
                logger.warn(`Parsed log line does not conform to LogLine type. Line: ${JSON.stringify(line)}`);
                return null;
            }
            return line;
        } catch (error) {
            logger.warn(`Failed to parse log line: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    _transform(msg: RawLogMessage, encoding: BufferEncoding, callback: (error?: Error | null, data?: any) => void): void {
        if (msg.action === "reset") {
            this.push({ action: "reset" });
            return callback();
        }

        const logLine = this.createLogLine(msg.parts);
        if (logLine) {
            this.push(logLine);
        }
        callback();
    }
}