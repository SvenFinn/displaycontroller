import { compile } from "path-to-regexp";
import { isHttpError, Response } from ".";
import { Endpoint, GetEndpoint, MutatingEndpoint } from "./endpoint";

export type GetRequest<P extends object, Q extends object> = {
    params: P;
    query: Q;
};

export type MutatingRequest<P extends object, Q extends object, B> = GetRequest<P, Q> & {
    body: B;
};

export async function request<P extends object, Q extends object, RB>(endpoint: GetEndpoint<P, Q, RB>, params: P, query: Q): Promise<Response<RB>>;
export async function request<P extends object, Q extends object, B, RB>(endpoint: MutatingEndpoint<P, Q, B, RB>, params: P, query: Q, body: B): Promise<Response<RB>>;
export async function request<P extends object, Q extends object, B, RB>(endpoint: Endpoint<P, Q, B, RB>, params: P, query: Q, body?: B): Promise<Response<RB>> {
    const { method, request, response } = endpoint;
    if (!request.isParams(params)) {
        return {
            code: 400,
            message: "Path parameters could not be validated locally"
        }
    }
    if (!request.isQuery(query)) {
        return {
            code: 400,
            message: "Query parameters could not be validated locally"
        }
    }
    if (method !== 'GET' && !request.isBody(body)) {
        return {
            code: 400,
            message: "Request body could not be validated locally"
        }
    }
    const searchParams = new URLSearchParams(
        Object.entries(query).map(([k, v]) => [k, String(v)])
    );
    const toPath = compile(request.path);
    const resolvedPath = toPath(params);
    const queryString = searchParams.toString();
    const url = queryString ? `${resolvedPath}?${queryString}` : resolvedPath;
    const result = await fetch(url, {
        method,
        body: method === 'GET' ? undefined : JSON.stringify(body),
        headers: method === 'GET' ? undefined : {
            "Content-Type": "application/json"
        }
    });
    if (result.ok) {
        if (result.status === 204 || result.status === 205) {
            return {
                code: result.status
            };
        }
        let responseBody: unknown;
        try {
            responseBody = await result.json();
        } catch (e) {
            return {
                code: 500,
                message: "Response body is not valid JSON"
            };
        }
        if (response.isResponseBody(responseBody)) {
            return {
                code: result.status,
                body: responseBody
            };
        } else {
            return {
                code: 500,
                message: "Response body could not be validated locally"
            };
        }
    } else {
        try {
            const errorBody = await result.json();
            if (!isHttpError(errorBody)) {
                return {
                    code: 500,
                    message: "Error response body could not be validated locally"
                };
            }
            return errorBody;
        } catch (e) {
            return {
                code: 500,
                message: "Error response body is not valid JSON"
            };
        }
    }
}