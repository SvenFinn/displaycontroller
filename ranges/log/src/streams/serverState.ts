import { EventSource } from "eventsource";
import { Readable } from "stream";

export class ServerStateStream extends Readable {
    private eventSource: EventSource;

    constructor() {
        super({ objectMode: true });
        this.eventSource = new EventSource(`http://server-state/api/serverState/sse`);
        this.createEventSource();
    }

    private createEventSource() {
        this.eventSource.close();
        this.eventSource = new EventSource(`http://server-state/api/serverState/sse`);
        this.eventSource.onmessage = (message) => {
            this.push(JSON.parse(message.data));
        };
        this.eventSource.onerror = this.createEventSource.bind(this);
    }

    _read() {
        // Do nothing
    }
}