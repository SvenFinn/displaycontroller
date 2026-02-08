import { Duplex } from "node:stream";

export class TypedDuplex<I, O> extends Duplex {
    declare _inputType: I;
    declare _outputType: O;

    constructor() {
        super({
            readableObjectMode: true,
            writableObjectMode: true
        });
    }

    // Typed writable side
    write(chunk: I): boolean {
        return super.write(chunk);
    }

    // Typed readable side
    push(chunk: O | null): boolean {
        return super.push(chunk);
    }

    // Typed data listener
    override on(event: "data", listener: (chunk: O) => void): this;
    override on(event: string, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }
}
