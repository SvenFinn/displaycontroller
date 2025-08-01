import { Range } from "@shared/ranges";
import { InternalRange } from "@shared/ranges/internal";
import { EventEmitter } from "events";
import { TTLHandler } from "dc-ranges-ttl";
import { mergeRange } from "./merge";
import { clear } from "console";

export class RangeMerger extends EventEmitter {
    private readonly rangeId: number;
    private rangeData: Range;
    private sourceData: Array<TTLHandler<InternalRange>>;
    private resendTimeout: NodeJS.Timeout;
    private resendCount: number = 0;
    constructor(rangeId: number) {
        super();
        this.rangeId = rangeId;
        this.rangeData = {
            id: rangeId,
            active: false,
        }
        this.sourceData = [];
        for (const source of ["ssmdb2", "log", "multicast"]) {
            const ttlHandler = new TTLHandler<InternalRange>();
            ttlHandler.on("message", this.mergeData.bind(this));
            this.sourceData.push(ttlHandler);
        }
        this.resendTimeout = setTimeout(this.resend.bind(this), 30000);
    }

    public setData(sourceData: InternalRange) {
        if (sourceData.rangeId !== this.rangeId) {
            return;
        }
        switch (sourceData.source) {
            case "ssmdb2":
                this.sourceData[0].setMessage(sourceData);
                break;
            case "log":
                this.sourceData[1].setMessage(sourceData);
                break;
            case "multicast":
                this.sourceData[2].setMessage(sourceData);
                break;
            default:
                throw new Error(`Unknown source ${sourceData.source}`);
        }
    }

    private mergeData() {
        const newRangeData = mergeRange(this.sourceData, this.rangeId);
        this.resendCount = 0;
        if (JSON.stringify(newRangeData) !== JSON.stringify(this.rangeData)) {
            this.rangeData = newRangeData;
            this.emit("update", this.rangeData);
            clearTimeout(this.resendTimeout);
            this.resendTimeout = setTimeout(this.resend.bind(this), 30000);
        }
    }

    public getRangeData(): Range {
        return this.rangeData;
    }

    public isFree(): boolean {
        if (this.rangeData.active === false) return false;
        return this.rangeData.shooter === null;
    }

    public isActive(): boolean {
        return this.rangeData.active;
    }

    private resend() {
        this.emit("update", this.rangeData);
        if (!this.rangeData.active) {
            this.resendCount++;
        }
        if (this.resendCount < 3) {
            clearTimeout(this.resendTimeout);
            this.resendTimeout = setTimeout(this.resend.bind(this), 30000);
        }
    }
}
