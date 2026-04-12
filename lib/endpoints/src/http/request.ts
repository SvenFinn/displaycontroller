import { compile } from "path-to-regexp";
import { isHttpError, Response } from "./index.js";
import { Endpoint, GetEndpoint, MutatingEndpoint } from "./endpoint.js";

export type GetRequest<P, Q> = {
    params: P;
    query: Q;
};

export type MutatingRequest<P, Q, B> = GetRequest<P, Q> & {
    body: B;
};

export async function request<RB>(baseUrl: string, endpoint: GetEndpoint<void, void, RB>): Promise<Response<RB>>;
export async function request<P, RB>(baseUrl: string, endpoint: GetEndpoint<P, void, RB>, params: P): Promise<Response<RB>>;
export async function request<P, Q, RB>(baseUrl: string, endpoint: GetEndpoint<P, Q, RB>, params: P, query: Q): Promise<Response<RB>>;
export async function request<P, Q, B, RB>(baseUrl: string, endpoint: MutatingEndpoint<P, Q, B, RB>, params: P, query: Q, body: B): Promise<Response<RB>>;
export async function request<P, Q, B, RB>(baseUrl: string, endpoint: Endpoint<P, Q, B, RB>, params?: P, query?: Q, body?: B): Promise<Response<RB>> {
    const { method, request, response } = endpoint;
    if (!request.isParams(params)) {
        return {
            type: "error",
            code: 400,
            message: "Path parameters could not be validated locally"
        }
    }
    if (!request.isQuery(query)) {
        return {
            type: "error",
            code: 400,
            message: "Query parameters could not be validated locally"
        }
    }
    if (method !== 'GET' && !request.isBody(body)) {
        return {
            type: "error",
            code: 400,
            message: "Request body could not be validated locally"
        }
    }
    const searchParams = new URLSearchParams(
        Object.entries(query || {}).map(([k, v]) => [k, String(v)])
    );
    const toPath = compile(request.path);
    const resolvedPath = toPath(params || undefined);
    const queryString = searchParams.toString();
    const relativeUrl = queryString ? `${resolvedPath}?${queryString}` : resolvedPath;
    const url = new URL(relativeUrl, baseUrl);

    const result = await fetchWithRetry(url, {
        method,
        body: method === 'GET' ? undefined : JSON.stringify(body),
        headers: method === 'GET' ? undefined : {
            "Content-Type": "application/json"
        }
    });
    if (result.ok) {
        if (result.status === 204 || result.status === 205) {
            return {
                type: "success",
                code: result.status,
                body: null
            };
        }
        let responseBody: unknown;
        try {
            responseBody = await result.json();
        } catch (e) {
            return {
                type: "error",
                code: 500,
                message: "Response body is not valid JSON"
            };
        }
        if (response.isResponseBody(responseBody)) {
            return {
                type: "success",
                code: result.status,
                body: responseBody
            };
        } else {
            return {
                type: "error",
                code: 500,
                message: "Response body could not be validated locally"
            };
        }
    } else {
        try {
            const errorBody = await result.json();
            if (!isHttpError(errorBody)) {
                return {
                    type: "error",
                    code: result.status,
                    message: result.statusText
                };
            }
            return errorBody;
        } catch (e) {
            return {
                type: "error",
                code: result.status,
                message: result.statusText
            };
        }
    }
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
        await new Promise(r => setTimeout(r, retryDelay));
    }
}