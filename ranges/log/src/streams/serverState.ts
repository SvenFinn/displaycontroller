import { logger } from "dc-logger";
import { io, Socket } from "socket.io-client";
import { Readable } from "stream";

export class ServerStateStream extends Readable {
    private socket: Socket;

    constructor() {
        super({ objectMode: true });
        this.socket = io("http://server-state/api/serverState", { path: "/api/serverState/ws" });
        this.socket.on("connect", () => {
            logger.info("Connected to server state via socket.io");
        });
        this.socket.on("data", (data: boolean) => {
            this.push(data);
        });
    }

    _read() {
        // Do nothing
    }

    _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
        this.socket.close();
        callback(error);
    }
}