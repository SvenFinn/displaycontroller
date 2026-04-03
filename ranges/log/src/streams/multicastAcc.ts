import { InternalRange, InternalShooter } from "dc-ranges/types";
import { isSameShooter } from "../cache/shooter";
import { MulticastInternalRange } from "../types";
import { TypedTransform } from "dc-streams";

type ShooterSince = {
    shooter: InternalShooter | null,
    since: Date,
}

export class MulticastAccumulate extends TypedTransform<InternalRange, MulticastInternalRange> {
    private shooters: Map<number, ShooterSince> = new Map();

    constructor() {
        super();
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