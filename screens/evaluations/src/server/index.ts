import express, { Express, Request } from "express";
import * as fs from "fs";
import { logger } from "dc-logger";
import { scanDirectory } from "@shared/files/helpers";

const basePath = process.env.EVALUATIONS_VOLUME_PATH || "/app/evaluations";

const app: Express = express();

app.get("/api/evaluations{/*files}", async (req: Request, res) => {
    const path = (req.params.files as unknown as string[] || []).join("/");
    logger.info(`GET ${path}`);
    if (path.includes("..")) {
        logger.info("Found .. in path");
        res.status(404).send({
            code: 404,
            message: "Invalid path",
        });
        return;
    }
    const realPath = `${basePath}/${path}`;
    if (!fs.existsSync(realPath)) {
        logger.info("File not found");
        res.status(404).send({
            code: 404,
            message: "File not found"
        });
        return
    }
    if (fs.lstatSync(realPath).isDirectory()) {
        logger.info("Scanning directory");
        res.status(200).send(await scanDirectory(realPath));
    } else {
        res.status(200).sendFile(realPath);
    }
});

app.listen(80, () => {
    logger.info("Listening on port 80");
});