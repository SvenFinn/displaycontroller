import { InternalRange, Range } from "dc-ranges-types";
import { RangeMerger } from "../rangeMerger";
import { Response } from "express";
import { logger } from "dc-logger";
import { Namespace, Socket } from "socket.io";

export class RangeManager {
    private readonly ranges: Map<number, RangeMerger>
    private readonly allSSE: Array<Response>;
    private readonly rangeSSE: Map<number, Array<Response>>;
    private namespace: Namespace | null = null;
    constructor() {
        this.ranges = new Map();
        this.allSSE = [];
        this.rangeSSE = new Map();
    }
    public setNamespace(nsp: Namespace) {
        this.namespace = nsp;
    }
    public setData(data: InternalRange) {
        const rangeId = data.rangeId;
        if (!this.ranges.has(rangeId)) {
            const rangeMerger = new RangeMerger(rangeId);
            rangeMerger.on("update", this.sendSSE.bind(this));
            this.ranges.set(rangeId, rangeMerger);
        }
        this.ranges.get(rangeId)?.setData(data);
    }
    public addSocket(socket: Socket, ranges: number[] | null) {
        if (!this.namespace) {
            logger.error("Namespace not set in RangeManager");
            return;
        }
        if (ranges) {
            for (const range of ranges) {
                socket.join(`range:${range}`);
                socket.emit('range', this.getRangeData(range));
            }
        } else {
            for (const range of this.ranges.keys()) {
                socket.emit('range', this.getRangeData(range));
            }
            socket.join('all');
        }
    }

    public addSSE(response: Response, ranges: number[] | null) {
        if (ranges) {
            for (const range of ranges) {
                if (!this.rangeSSE.has(range)) {
                    this.rangeSSE.set(range, []);
                }
                this.rangeSSE.get(range)?.push(response);
                response.write(`data: ${JSON.stringify(this.getRangeData(range))}\n\n`);
            }
        } else {
            this.allSSE.push(response);
            for (const range of this.ranges.keys()) {
                response.write(`data: ${JSON.stringify(this.getRangeData(range))}\n\n`);
            }
        }
    }
    public removeSSE(response: Response) {
        if (this.allSSE.includes(response)) {
            this.allSSE.splice(this.allSSE.indexOf(response), 1);
        }
        for (const range of this.rangeSSE.keys()) {
            const rangeSSE = this.rangeSSE.get(range);
            if (!rangeSSE) {
                continue;
            }
            if (rangeSSE.includes(response)) {
                rangeSSE.splice(rangeSSE.indexOf(response), 1);
            }
        }
    }
    private sendSSE(data: Range) {
        logger.info(`Sending update for range ${data.id}`);
        for (const response of this.allSSE) {
            response.write(`data: ${JSON.stringify(data)}\n\n`);
        }
        for (const response of this.rangeSSE.get(data.id) || []) {
            response.write(`data: ${JSON.stringify(data)}\n\n`);
        }
        if (!this.namespace) {
            logger.error("Namespace not set in RangeManager");
            return;
        }
        this.namespace.to(`range:${data.id}`).volatile.emit('range', data);
        this.namespace.to('all').volatile.emit('range', data);

    }
    public getRangeData(rangeId: number): Range {
        if (this.ranges.has(rangeId)) {
            return this.ranges.get(rangeId)!.getRangeData();
        }
        return {
            id: rangeId,
            active: false
        }
    }
    public getFreeRanges(): number[] {
        return [...this.ranges.keys()].filter((rangeId) => {
            return this.ranges.get(rangeId)?.isFree() || false;
        }).sort((a, b) => a - b);
    }
    public getActiveRanges(): number[] {
        return [...this.ranges.keys()].filter((rangeId) => {
            return this.ranges.get(rangeId)?.isActive() || false;
        }).sort((a, b) => a - b);
    }
}

export const rangeManager = new RangeManager();