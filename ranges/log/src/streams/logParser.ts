import { Transform } from "stream";
import { logger } from "dc-logger";
import { LogMessage, LogLine } from "../types";


export class LogParserStream extends Transform {
    constructor() {
        super({ objectMode: true });
    }

    _transform(line: string, encoding: BufferEncoding, callback: (error?: Error | null, data?: any) => void): void {
        if (line === "LOG_RESET") {
            const message: LogMessage = { action: "reset" };
            this.push(message);
            callback();
            return
        }
        logger.debug("Parsing line", line);
        const values = line.split(";");
        for (let i = 0; i < values.length; i++) {
            values[i] = values[i].replace(/^"|"$/g, "");
            values[i] = values[i].trim();
        }
        if (values.length != 30) {
            logger.warn(`log line does not have correct length: ${values.length} != 30`);
            callback();
            return;
        }
        try {
            const logInformation: LogLine = {
                rangeId: parseInt(values[0]),
                targetId: this.parseTargetId(values[26]) || -1,
                action: values[27] == "i" ? "insert" : "delete",
                shooter: {
                    name: values[6],
                    id: Number(values[7]),
                    team: values[8],
                    club: values[9],
                    class: {
                        name: values[10],
                        id: parseInt(values[11]),
                    },
                },
                discipline: {
                    name: values[2],
                    id: parseInt(values[3]),
                },
                round: {
                    name: values[4],
                    id: parseInt(values[5]),
                },
                hit: {
                    id: parseInt(values[13]),
                    x: parseFloat(values[17]) / 100,
                    y: parseFloat(values[18]) / 100,
                    divisor: parseFloat(values[19]),
                    innerRing: values[28] === "IZ",
                    rings: parseFloat(values[16].replace(/,/gi, ".")),
                },
                timestamp: this.parseTimeStamp(values[15], values[14]) || new Date(),

            }
            this.push(logInformation);
        } catch (error) {
            logger.warn(`Error occurred whilst trying to parse line: ${error}`);
        }
        callback();
    }

    private parseTargetId(targetId: string): undefined | number {
        if (targetId.match("0x") != null) {
            const intTargetId = parseInt(targetId, 16);
            if (intTargetId > 2147483647) {
                return intTargetId - 4294967296;
            }
            return intTargetId;
        }
        logger.warn("Failed to parse targetId");
        return undefined;
    }

    private parseTimeStamp(dateStr: string, timeStr: string): undefined | Date {
        if (dateStr.length == 0 || timeStr.length == 0) {
            logger.warn("Failed to parse timestamp, len=0");
            return undefined;
        }
        const date = dateStr.split(".").map((value) => parseInt(value));
        const tempTime = timeStr.split(":");
        if (date.length != 3 || tempTime.length != 3) {
            logger.warn(`Failed to parse timestamp ${date} ${tempTime}`);
            return undefined;
        }
        const time = [tempTime[0], tempTime[1], ...tempTime[2].split(".")].map((value) => parseInt(value));
        if (date.includes(NaN) || time.includes(NaN)) {
            logger.warn("Failed to parse timestamp, NAN");
            return undefined;
        }
        return new Date(date[2], date[1] - 1, date[0], time[0], time[1], time[2], time[3]);
    }
}