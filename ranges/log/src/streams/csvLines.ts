import { Transform } from "stream";
import { logger } from "dc-logger";
import { RawLogMessage } from "../types";
import { parse } from "csv-parse/sync";


export class CsvLineStream extends Transform {
    constructor() {
        super({ objectMode: true });
    }

    _transform(line: string, encoding: BufferEncoding, callback: (error?: Error | null, data?: any) => void): void {
        if (line === "LOG_RESET") {
            const message: RawLogMessage = { action: "reset" };
            this.push(message);
            return callback();

        }
        try {
            const records = parse(line, {
                delimiter: ";",
                relax_column_count: true,
                trim: true,
            });

            if (records.length > 0) {
                this.push({
                    action: "line",
                    parts: records[0],
                } as RawLogMessage);
            }
        } catch (err) {
            logger.error(`Error parsing CSV: ${err}`);
        }
        callback();
    }
}