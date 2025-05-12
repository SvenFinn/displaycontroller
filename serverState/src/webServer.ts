import express, { Request, Response, Express } from "express";
import { AdvServerState } from "./types";
import { logger } from "dc-logger";

const app: Express = express();

let serverInf: AdvServerState = {
    online: false
};

let sockets: Response[] = [];


app.get("/api/serverState", (req: Request, res: Response) => {
    res.status(200).send(serverInf.online ? serverInf.compatible : false);
});

app.get("/api/serverState/full", (req: Request, res: Response) => {
    res.status(200).send(serverInf);
});

app.get("/api/serverState/sse", (req: Request, res: Response) => {
    logger.info("New serverState connection");
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Content-Encoding': 'none',
    };
    res.writeHead(200, headers);

    res.write(`data: ${serverInf.online ? serverInf.compatible : false}\n\n`);

    sockets.push(res);

    req.on("close", () => {
        sockets = sockets.filter((socket) => socket !== res);
    });
});

export function updateServerState(newServerInf: AdvServerState) {
    logger.info("Sending serverState update");
    serverInf = newServerInf;
    sockets.forEach((socket) => {
        socket.write(`data: ${serverInf.online ? serverInf.compatible : false}\n\n`);
    });
}

app.listen(80, () => {
    logger.info("Listening on port 80");
});