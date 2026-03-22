import { Writable } from "stream";

export class TypedWritable<I> extends Writable {
    declare _inputType: I;

    constructor() {
        super({ objectMode: true })
    }

    write(chunk: I): boolean {
        return super.write(chunk)
    }
}