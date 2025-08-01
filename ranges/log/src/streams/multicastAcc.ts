import { InternalRange, InternalShooter } from "@shared/ranges/internal";
import { Transform } from "stream";
import { isSameShooter } from "../cache/shooter";
import { MulticastInternalRange } from "../types";

type ShooterSince = {
    shooter: InternalShooter | null,
    since: Date,
}

export class MulticastAccumulate extends Transform {
    private shooters: Map<number, ShooterSince> = new Map();

    constructor() {
        super({ objectMode: true });
    }

    _transform(chunk: InternalRange, encoding: BufferEncoding, callback: (error?: Error | null, data?: any) => void): void {
        if (!this.shooters.has(chunk.rangeId)) {
            this.shooters.set(chunk.rangeId, {
                shooter: chunk.shooter,
                since: new Date(),
            });
        }

        if (!isSameShooter(this.shooters.get(chunk.rangeId)!.shooter, chunk.shooter)) {
            this.shooters.set(chunk.rangeId, {
                shooter: chunk.shooter,
                since: new Date(),
            });
        }

        const range: MulticastInternalRange = {
            ...chunk,
            onRangeSince: this.shooters.get(chunk.rangeId)!.since,
        }

        this.push(range);
        callback();
    }
}