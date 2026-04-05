import express, { Request, Response, Express } from "express";
import { AdvServerState } from "dc-server-state/types";
import { logger } from "dc-logger";
import http from "http";
import { Server as IOServer } from "socket.io";
import { registerEndpoint } from "dc-endpoints";
import { getFullServerState, getServerState } from "dc-server-state/endpoints";

const app: Express = express();
// HTTP server (used for both express and socket.io)
const server = http.createServer(app);
const io = new IOServer(server, {
    // serve the socket.io endpoint under this base path
    path: '/api/serverState/ws',
}).of("/api/serverState");

let serverInf: AdvServerState = {
    online: false
};

registerEndpoint(app, getServerState, async (params, query) => {
    return serverInf.online ? serverInf.compatible : false;
});

registerEndpoint(app, getFullServerState, async (params, query) => {
    return serverInf;
});

export function updateServerState(newServerInf: AdvServerState) {
    logger.info("Sending serverState update");
    serverInf = newServerInf;
    io.emit('data', serverInf.online ? serverInf.compatible : false);
}

io.on('connection', (socket) => {
    logger.info('socket.io client connected: ' + socket.id);
    setTimeout(() => {
        socket.emit('data', serverInf.online ? serverInf.compatible : false);
    }, 100);
    socket.on('disconnect', () => {
        logger.info('socket.io client disconnected: ' + socket.id);
    });
});

server.listen(80, () => {
    logger.info("Listening on port 80");
});