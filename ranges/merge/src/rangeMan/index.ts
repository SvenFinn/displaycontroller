import { InternalRange, Range } from "dc-ranges-types";
import { RangeMerger } from "../rangeMerger";
import { logger } from "dc-logger";
import { Namespace, Socket } from "socket.io";

export class RangeManager {
    private readonly ranges: Map<number, RangeMerger>
    private namespace: Namespace | null = null;
    constructor() {
        this.ranges = new Map();
    }
    public setNamespace(nsp: Namespace) {
        this.namespace = nsp;
    }
    public setData(data: InternalRange) {
        const rangeId = data.rangeId;
        if (!this.ranges.has(rangeId)) {
            const rangeMerger = new RangeMerger(rangeId);
            rangeMerger.on("update", this.sendUpdate.bind(this));
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
                socket.emit('data', this.getRangeData(range));
            }
        } else {
            for (const range of this.ranges.keys()) {
                socket.emit('data', this.getRangeData(range));
            }
            socket.join('all');
        }
    }

    private sendUpdate(data: Range) {
        logger.info(`Sending update for range ${data.id}`);
        if (!this.namespace) {
            logger.error("Namespace not set in RangeManager");
            return;
        }
        this.namespace.to(`range:${data.id}`).emit('data', data);
        this.namespace.to('all').emit('data', data);

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