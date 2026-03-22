import { Readable, Writable } from "stream";
import { TypedWritable } from "./writable.js";
import { TypedTransform } from "./transform.js";

export class TypedReadable<O> extends Readable {
    declare _outputType: O;

    constructor() {
        super({ objectMode: true })
    }

    push(chunk: O | null): boolean {
        return super.push(chunk);
    }

    pipe<N>(dest: TypedTransform<O, N>): TypedTransform<O, N>;
    pipe(dest: TypedWritable<O>): TypedWritable<O>;
    pipe(dest: Writable): Writable;
    pipe(dest: Writable): Writable {
        return super.pipe(dest);
    }
}