import { Request as ExpressRequest } from "express";
import { Endpoint, EndpointMultiPartRequest } from "../endpoint.js";
import { EndpointResult, failure, success } from "../../result.js";

export function processFiles<P, Q, B>(reqFiles: ExpressRequest["files"], request: EndpointMultiPartRequest<P, Q, B>): EndpointResult<Array<Express.Multer.File>> {
    const { acceptedMimeTypes } = request;

    const files = Array.isArray(reqFiles) ? reqFiles : Object.values(reqFiles || {}).flat();

    for (const file of files) {
        if (!acceptedMimeTypes.includes(file.mimetype)) {
            return failure(`Invalid MIME type: ${file.originalname}`);
        }
    }

    return success(files);
}


type GetDecodedRequest<P, Q> = {
    type: "get";
    params: P;
    query: Q;
};

type BodyDecodedRequest<P, Q, B> = {
    type: "body";
    params: P;
    query: Q;
    body: B;
};

type MultipartDecodedRequest<P, Q, B> = {
    type: "multipart";
    params: P;
    query: Q;
    body: B;
    files: Express.Multer.File[];
};

type DecodedRequest<P, Q, B> =
    | GetDecodedRequest<P, Q>
    | BodyDecodedRequest<P, Q, B>
    | MultipartDecodedRequest<P, Q, B>;

export function decodeRequest<P, Q, B, RB>(req: ExpressRequest, endpoint: Endpoint<P, Q, B, RB>): EndpointResult<DecodedRequest<P, Q, B>> {
    const { request, method } = endpoint;

    if (!request.isParams(req.params)) {
        return failure("Invalid params");
    }

    if (!request.isQuery(req.query)) {
        return failure("Invalid query");
    }

    if (method === "GET") {
        return success({
            type: "get",
            params: req.params,
            query: req.query,
        });
    }

    if ("acceptedMimeTypes" in request) {

        const files = processFiles(req.files, request);
        if (files.type === "failure") {
            return failure(files.error);
        }

        if (!("body" in req.body)) {
            return failure("Invalid multipart body");
        }

        let body: unknown;
        try {
            body = JSON.parse(req.body.body);
        } catch {
            return failure("Invalid JSON in multipart body");
        }

        if (!request.isBody(body)) {
            return failure("Invalid body");
        }

        return success({
            type: "multipart",
            params: req.params,
            query: req.query,
            body,
            files: files.value,
        });
    } else {
        if (!request.isBody(req.body)) {
            return failure("Invalid body");
        }
        return success({
            type: "body",
            params: req.params,
            query: req.query,
            body: req.body,
        });
    }
}