import { EventEmitter } from "node:events";

export class TTLHandler<MessageType> extends EventEmitter {
    private message: MessageType | null = null;
    private ttl: number = 0;
    private timeout: NodeJS.Timeout | null = null;

    constructor() {
        super();
    }

    public setMessage(message: MessageType) {
        this.message = message;
        this.ttl = 30;
        if (typeof (message) === "object" && message !== null) {
            const ttl = (message as any).ttl;
            if (typeof ttl === "number") {
                this.ttl = ttl;
            }
        }
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.clearMessage.bind(this), this.ttl);
        this.emit("message", this.message);
    }

    public getMessage(): MessageType | null {
        return this.message;
    }
    private clearMessage() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.message = null;
        this.emit("message", null);
    }
}