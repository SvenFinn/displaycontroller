import { compile } from "path-to-regexp";
import { EndpointResult, failure, success } from "../../result.js";
import { Endpoint } from "../endpoint.js";

type EncodedRequest = {
    path: string;
    body: FormData | string | undefined;
};

export function encodeRequest<P, Q, B, RB>(endpoint: Endpoint<P, Q, B, RB>, params: P, query: Q, body: B, files?: Blob[]): EndpointResult<EncodedRequest> {
    const { request, method } = endpoint;

    const { path, isParams, isQuery } = request;
    if (!isParams(params)) {
        return failure("Path parameters could not be validated locally");
    }
    if (!isQuery(query)) {
        return failure("Query parameters could not be validated locally");

    }
    const searchParams = new URLSearchParams();

    if (query != null) {
        for (const [k, v] of Object.entries(query)) {
            searchParams.append(k, String(v));
        }
    }

    const toPath = compile(path);
    const resolvedPath = toPath(params ?? undefined);
    const queryString = searchParams.toString();
    const relativeUrl = queryString ? `${resolvedPath}?${queryString}` : resolvedPath;

    if (method === "GET") {
        return success({
            path: relativeUrl,
            body: undefined,
        });
    }

    if (!request.isBody(body)) {
        return failure("Request body could not be validated locally");
    }

    if ("acceptedMimeTypes" in request) {
        const formData = new FormData();
        formData.append("body", JSON.stringify(body));
        for (const file of files || []) {
            formData.append("files", file);
        }
        return success({
            path: relativeUrl,
            body: formData,
        });
    }

    return success({
        path: relativeUrl,
        body: JSON.stringify(body),
    });
}
