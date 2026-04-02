export * from "./http/index.js";

export type Empty = undefined;

export function isEmpty(value: unknown): value is Empty {
    return value === undefined || value === null || (typeof value === 'object' && Object.keys(value).length === 0);
}