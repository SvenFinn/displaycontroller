import { InternalRange } from "@shared/ranges/internal";
import { RangeMerger } from "../rangeMerger";
import { Response } from "express";
import { Range } from "@shared/ranges/index";
import { logger } from "dc-logger";

export class RangeManager {
    private readonly ranges: Map<number, RangeMerger>
    private readonly allSSE: Array<Response>;
    private readonly rangeSSE: Map<number, Array<Response>>;
    constructor() {
        this.ranges = new Map();
        this.allSSE = [];
        this.rangeSSE = new Map();
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