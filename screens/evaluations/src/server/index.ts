import express, { Express, Request } from "express";
import * as fs from "fs";
import { logger } from "dc-logger";
import { scanDirectory } from "@shared/files";

const basePath = process.env.EVALUATIONS_VOLUME_PATH || "/app/evaluations";

const app: Express = express();

app.get("/api/evaluations/?*", async (req: Request, res) => {
    logger.info(`GET ${req.params[0]}`);
    if (req.params[0].includes("..")) {
        logger.info("Found .. in path");
        res.status(404).send({
            code: 404,
            message: "Invalid path",
        });
        return;
    }
    const path = `${basePath}/${req.params[0]}`;
    if (!fs.existsSync(path)) {
        logger.info("File not found");
        res.status(404).send({
            code: 404,
            message: "File not found"
        });
        return
    }
    if (fs.lstatSync(path).isDirectory()) {
        logger.info("Scanning directory");
        res.status(200).send(await scanDirectory(path));
    } else {
        res.status(200).sendFile(path);
    }
});

app.listen(80, () => {
    logger.info("Listening on port 80");
});