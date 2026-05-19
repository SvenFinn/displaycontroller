import express, { Express, Request } from "express";
import * as fs from "fs";
import { logger } from "dc-logger";
import { createDirectoryListing, fileExists, resolveSafePath } from "dc-screens/files/scanDir";
import { htmlPath } from "../constants";
import { registerEndpoint } from "dc-endpoints/server";
import { getEvaluations } from "dc-screens/endpoints";

const app: Express = express();

app.set("trust proxy", 1);

registerEndpoint(app, getEvaluations, async (params) => {
    const segments = params.pathSegments || [];
    const path = resolveSafePath(segments.join("/"), htmlPath);
    logger.info(`GET metadata for ${path}`);

    if (!path) {
        logger.info("Invalid path");
        return {
            code: 404,
            message: "File not found"
        };
    }
    if (!fs.existsSync(path)) {
        logger.info("File not found");
        return {
            code: 404,
            message: "File not found"
        };
    }

    const relativePath = segments.join("/");

    return await createDirectoryListing(path, `/api/evaluations/raw/${relativePath}`);
});

app.get("/api/evaluations/raw{/*pathSegments}", async (req: Request, res) => {
    const segments = req.params.pathSegments as unknown as string[] || [];
    logger.info(`GET raw file for ${segments.join("/")}`);
    const path = resolveSafePath(segments.join("/"), htmlPath);
    if (!path) {
        logger.info("Invalid path");
        res.status(404).send({
            code: 404,
            message: "File not found"
        });
        return;
    }

    if (!await fileExists(path)) {
        logger.info("File not found");
        res.status(404).send({
            code: 404,
            message: "File not found"
        });
        return;
    }

    if ((await fs.promises.lstat(path)).isDirectory()) {
        res.status(400).send({
            code: 400,
            message: "Bad request"
        });
        return;
    } else {
        res.status(200).sendFile(path);
    }
});

app.listen(80, () => {
    logger.info("Listening on port 80");
});