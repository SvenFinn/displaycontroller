import { Transform, TransformCallback, Writable } from "stream";
import { TypedWritable } from "./writable.js";

export abstract class TypedTransform<I, O> extends Transform {
    declare _inputType: I;
    declare _outputType: O;

    constructor() {
        super({ objectMode: true })
    }

    abstract _transform(
        chunk: I,
        encoding: BufferEncoding,
        callback: TransformCallback
    ): void;

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