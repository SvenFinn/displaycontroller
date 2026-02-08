import { logger } from "dc-logger";
import { TypedReadable } from "dc-streams";
import { io, Socket } from "socket.io-client";

export class ServerStateStream extends TypedReadable<boolean> {
    private socket: Socket;

    constructor() {
        super();
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