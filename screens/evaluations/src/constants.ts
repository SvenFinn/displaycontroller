import dotenv from "dotenv";
import * as fs from "fs";
dotenv.config({ quiet: true });

export const htmlPath = process.env.EVALUATIONS_VOLUME_PATH || "/app/evaluations";

if (!fs.existsSync(htmlPath)) {
    fs.mkdirSync(htmlPath, { recursive: true });
}