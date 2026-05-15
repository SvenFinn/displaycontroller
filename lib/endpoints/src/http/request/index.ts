import { Response } from "../index.js";
import { Endpoint, GetEndpoint, MutatingEndpoint, MutatingMultiPartEndpoint } from "../endpoint.js";
import { encodeRequest } from "./encoder.js";
import { decodeResponse } from "./responseDecoder.js";

export async function request<RB>(baseUrl: string, endpoint: GetEndpoint<void, void, RB>): Promise<Response<RB>>;
export async function request<P, RB>(baseUrl: string, endpoint: GetEndpoint<P, void, RB>, params: P): Promise<Response<RB>>;
export async function request<P, Q, RB>(baseUrl: string, endpoint: GetEndpoint<P, Q, RB>, params: P, query: Q): Promise<Response<RB>>;
export async function request<P, Q, B, RB>(baseUrl: string, endpoint: MutatingEndpoint<P, Q, B, RB>, params: P, query: Q, body: B): Promise<Response<RB>>;
export async function request<P, Q, B, RB>(baseUrl: string, endpoint: MutatingMultiPartEndpoint<P, Q, B, RB>, params: P, query: Q, body: B, files: Blob[]): Promise<Response<RB>>;
export async function request<P, Q, B, RB>(baseUrl: string, endpoint: Endpoint<P, Q, B, RB>, params?: P, query?: Q, body?: B, files: Blob[] = []): Promise<Response<RB>> {
    const { method, response } = endpoint;

    const encoded = encodeRequest(endpoint, params, query, body, files);
    if (encoded.type === "failure") {
        return {
            type: "error",
            code: 400,
            message: encoded.error,
        };
    }

    const url = new URL(encoded.value.path, baseUrl);

    const result = await fetchWithRetry(url, {
        method,
        body: encoded.value.body,
        headers: encoded.value.body instanceof FormData ? {} : { "Content-Type": "application/json" },
    });

    return decodeResponse(result, response);
}

async function fetchWithRetry(input: URL, init: RequestInit, retryDelay: number = 3000): Promise<globalThis.Response> {
    // Retry requests that failed with gateway errors (502, 503, 504)
    // And network errors (fetch throws with no response at all)
    while (true) {
        try {
            const res = await fetch(input, init);
            if (![502, 503, 504].includes(res.status)) {
                return res;
            }
        } catch (err) {
            // Network error, retry
        }
        await new Promise((r) => setTimeout(r, retryDelay));
    }
}