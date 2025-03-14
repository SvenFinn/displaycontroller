import { ChildProcess, spawn } from "child_process";
import { LocalClient } from "dc-db-local";
import { logger } from "dc-logger";
import * as fs from "fs";
import { Duplex } from "stream";

export class logReaderStream extends Duplex {
    private sshThread: ChildProcess | null = null;
    private localClient: LocalClient;
    private serverState: boolean = false;

    constructor(prisma: LocalClient) {
        super({ objectMode: true });
        this.localClient = prisma;
    }

    _write(chunk: boolean, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
        if (chunk == this.serverState) {
            callback();
            return;
        }
        logger.info("Server state changed", chunk);
        this.serverState = chunk;
        this.startSSH();
        callback();
    }

    private async startSSH() {
        if (this.sshThread !== null) {
            this.sshThread.kill();
            this.sshThread = null;
            this.push("LOG_RESET");
        }
        if (!this.serverState) {
            return;
        }
        const script = fs.readFileSync(`${__dirname}/range-logs.sh`, "utf-8");
        const serverIp = (await this.localClient.parameter.findUniqueOrThrow({
            where: {
                key: "MEYTON_SERVER_IP",
            }
        })).strValue;

        this.sshThread = spawn("sshpass", ["-p", process.env.MEYTON_SSH_PASS as string, "ssh", "-o", "StrictHostKeyChecking=no", `${process.env.MEYTON_SSH_USER}@${serverIp}`, script]);
        this.sshThread.on("exit", (code) => {
            if (this.serverState) {
                logger.warn("SSH exit", code);
                this.startSSH();
            }
        });
        let dataBuffer: string = "";
        this.sshThread.stdout?.on("data", (data: any) => {
            logger.debug("Received log data");
            dataBuffer += data.toString();
            const splitBuffer = dataBuffer.split("\n");
            while (splitBuffer.length > 1) {
                this.push(splitBuffer.shift());
            }
            dataBuffer = splitBuffer.join("\n");
        });
        this.sshThread.stderr?.on("data", (data: any) => {
            const str = data.toString();
            if (str.length > 0) {
                logger.warn("SSH error", str);
            }
        });
    }

    _read() {
        // Do nothing
    }
}