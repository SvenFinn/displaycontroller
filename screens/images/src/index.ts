import express, { Express, Request } from "express";
import * as fs from "fs";
import fileUpload from "express-fileupload";
import { fromPath } from "pdf2pic";
import { scanDirectory } from "@shared/files/scanDir";
import { logger } from "dc-logger";
import bodyParser from "body-parser";

const basePath = `/app/files`;

if (!fs.existsSync(basePath)) {
    logger.debug("Creating base path");
    fs.mkdirSync(basePath, { recursive: true });
}
if (!fs.existsSync(`${basePath}/icon.png`)) {
    logger.debug("Creating icon.png");

    fs.copyFileSync(`${__dirname}/img/icon.png`, `${basePath}/icon.png`);
}

const app: Express = express();
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
}));
app.use(bodyParser.json());

app.get("/api/images{/*files}", async (req: Request, res) => {
    const path = (req.params.files as unknown as string[] || []).join("/");
    logger.info(`GET ${path}`);
    if (path.includes("..")) {
        logger.info("Found .. in path");
        res.status(404).sendFile("img/404.svg", { root: __dirname });
        return;
    }
    const realPath = `${basePath}/${path}`;
    if (!fs.existsSync(realPath)) {
        logger.info("File not found");
        res.status(404).sendFile("img/404.svg", { root: __dirname });
        return
    }
    if (fs.lstatSync(realPath).isDirectory()) {
        logger.info("Scanning directory");
        res.status(200).send(await scanDirectory(realPath));
        return;
    } else {
        res.status(200).sendFile(realPath);
    }
});


async function handleFiles(files: fileUpload.FileArray, path: string) {
    for (const [key, file] of Object.entries(files)) {
        if (Array.isArray(file)) {
            for (const f of file) {
                logger.debug(`Handling file ${f.name}`);
                await handleFile(f, path);
            }
        } else {
            logger.debug(`Handling file ${file.name}`);
            await handleFile(file, path);
        }
    }
}

async function handleFile(file: fileUpload.UploadedFile, path: string) {
    if (file.mimetype === "application/pdf") {
        logger.info("Converting PDF to images");
        let minDimension = 1920;
        if (process.env.SCREEN_RESOLUTION) {
            const screenResolution = process.env.SCREEN_RESOLUTION.split("x").map((v) => parseInt(v));
            minDimension = Math.min(...screenResolution.filter((v) => !isNaN(v)), minDimension);
        }
        logger.debug(`Using resolution ${minDimension}`);
        if (fs.existsSync(`${path}/${file.name}`)) {
            fs.rmSync(`${path}/${file.name}`, { recursive: true });
        }
        fs.mkdirSync(`${path}/${file.name}`);
        const pdf = fromPath(file.tempFilePath, {
            density: 300,
            savePath: path + "/" + file.name,
            saveFilename: "page",
            width: minDimension,
            height: minDimension,
            format: "png",
            preserveAspectRatio: true,
        });
        const converted = await pdf.bulk(-1);
        const digitNumber = Math.floor(Math.log10(converted.length)) + 1;
        for (let i = 0; i < converted.length; i++) {
            const img = converted[i];
            if (!img.page || !img.path) {
                logger.warn("Image name is undefined");
                continue;
            }
            const fileNumber = img.page.toString().padStart(digitNumber, "0");
            const path = img.path.split("/").slice(0, -1).join("/");
            await fs.promises.rename(img.path, `${path}/page-${fileNumber}.png`);
        }
    } else {
        await file.mv(`${path}/${file.name}`);
    }
}

app.post("/api/images{/*files}", async (req: Request, res) => {
    const path = (req.params.files as unknown as string[] || []).join("/");
    logger.info(`POST ${path}`);
    if (path.includes("..")) {
        logger.info("Found .. in path");
        res.status(400).send({
            code: 400,
            message: "Invalid path",
        })
        return;
    }
    const realPath = `${basePath}/${path}`;
    let created = false;
    if (!fs.existsSync(realPath)) {
        logger.debug("Creating folder");
        await fs.promises.mkdir(realPath, { recursive: true });
        created = true;
    }
    if (!req.files) {
        if (created) {
            res.status(200).send({
                code: 200,
                message: "Folder created",
            });
            return;
        }
        res.status(400).send({
            code: 400,
            message: "No files uploaded",
        })
        return;
    }
    try {
        await handleFiles(req.files, realPath);
        res.status(200).send({
            code: 200,
            message: "Files uploaded",
        });
    } catch (err) {
        logger.warn(err);
        res.status(500).send({
            code: 500,
            message: "Error uploading files",
        })
    }
});

app.delete("/api/images{/*files}", (req: Request, res) => {
    const path = (req.params.files as unknown as string[] || []).join("/");
    logger.info(`DELETE ${path}`);
    if (path.includes("..")) {
        res.status(400).send({
            code: 400,
            message: "Invalid path",
        })
        return;
    }
    const realPath = `${basePath}/${path}`;
    if (!fs.existsSync(realPath)) {
        res.status(404).send({
            code: 404,
            message: "File not found",
        });
        return;
    }
    if (fs.lstatSync(realPath).isDirectory()) {
        fs.rm(realPath, { recursive: true }, (err) => {
            if (err) {
                res.status(500).send({
                    code: 500,
                    message: "Error deleting folder",
                });
                return;
            }
            res.status(200).send({
                code: 200,
                message: "Folder deleted",
            });
        });
    } else {
        fs.unlink(realPath, (err) => {
            if (err) {
                res.status(500).send({
                    code: 500,
                    message: "Error deleting file",
                });
                return;
            }
            res.status(200).send({
                code: 200,
                message: "File deleted",
            });
        });
    }
});

app.put("/api/images{/*files}", async (req: Request, res) => {
    const path = (req.params.files as unknown as string[] || []).join("/");
    logger.info(`PUT ${path}`);
    if (path.includes("..")) {
        res.status(400).send({
            code: 400,
            message: "Invalid path",
        })
        return;
    }
    const realPath = `${basePath}/${path}`;
    if (!fs.existsSync(realPath)) {
        res.status(404).send({
            code: 404,
            message: "File not found",
        });
        return;
    }
    const destination = req.body.destination;
    if (!destination) {
        res.status(400).send({
            code: 400,
            message: "No new path provided",
        });
        return;
    }
    if (destination.includes("..")) {
        res.status(400).send({
            code: 400,
            message: "Invalid new path",
        })
        return;
    }
    const realDestination = `${basePath}/${destination}`;
    if (fs.existsSync(realDestination)) {
        await fs.promises.rm(realDestination, { recursive: true });
    }
    await fs.promises.rename(realPath, realDestination);
    res.status(200).send({
        code: 200,
        message: "File moved",
    });
});


app.listen(80, () => {
    logger.info("Server is running on port 80");
});
