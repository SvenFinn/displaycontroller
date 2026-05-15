
// Rust-like Result type for endpoint handlers
export type EndpointResult<T> = Success<T> | Failure;

export type Success<T> = {
    type: "success";
    value: T;
};

export type Failure = {
    type: "failure";
    error: string;
};

export function success<T>(value: T): EndpointResult<T> {
    return { type: "success", value };
}

export function failure<T>(error: string): EndpointResult<T> {
    return { type: "failure", error };
}