import express, { Express, Request } from "express";
import * as fs from "fs";
import { logger } from "dc-logger";
import { scanDirectory } from "@shared/files/scanDir";
import { resolveSafePath } from "@shared/files/helpers";
import { rateLimit } from "express-rate-limit";
import { htmlPath } from "../constants";

const app: Express = express();

app.use(rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        code: 429,
        message: "Too many requests",
    },
}));
app.set("trust proxy", 1);

app.get("/api/evaluations{/*files}", async (req: Request, res) => {
    const path = (req.params.files as unknown as string[] || []).join("/");
    logger.info(`GET ${path}`);
    const realPath = resolveSafePath(htmlPath, path);
    if (!realPath) {
        logger.warn(`SECURITY: Path traversal attempt detected. Path: ${path}, IP: ${req.ip}`);
        res.status(404).send({
            code: 404,
            message: "Invalid path",
        });
        return;
    }
    if (!fs.existsSync(realPath)) {
        logger.info("File not found");
        res.status(404).send({
            code: 404,
            message: "File not found"
        });
        return;
    }
    if (fs.lstatSync(realPath).isDirectory()) {
        logger.info("Scanning directory");
        try {
            res.status(200).send(await scanDirectory(realPath));
        } catch (error) {
            logger.error(`Directory scan failed: ${error}`);
            res.status(500).send({ code: 500, message: "Internal server error" });
        }
    } else {
        res.status(200).sendFile(realPath);
    }
});

app.listen(80, () => {
    logger.info("Listening on port 80");
});