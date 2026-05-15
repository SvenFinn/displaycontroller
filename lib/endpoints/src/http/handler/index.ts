import { isHttpError, isResponse, Response } from "../index.js";
import { Express, Request as ExpressRequest, Response as ExpressResponse, RequestHandler, json } from "express";
import { Endpoint, GetEndpoint, MutatingEndpoint, MutatingMultiPartEndpoint } from "../endpoint.js";
import { logger } from "dc-logger";
import multer from "multer";
import { decodeRequest } from "./decoder.js";
import { sendResponse } from "./sender.js";

export type FileMutatingRequestHandler<P, Q, B, RB> = (params: P, query: Q, body: B, files: Express.Multer.File[]) => Promise<RB | Response<RB> | undefined>;
export type MutatingRequestHandler<P, Q, B, RB> = (params: P, query: Q, body: B) => Promise<RB | Response<RB> | undefined>;
export type GetRequestHandler<P, Q, RB> = (params: P, query: Q) => Promise<RB | Response<RB> | undefined>;

export function registerEndpoint<P, Q, RB>(app: Express, endpoint: GetEndpoint<P, Q, RB>, handler: GetRequestHandler<P, Q, RB>): void;
export function registerEndpoint<P, Q, B, RB>(app: Express, endpoint: MutatingEndpoint<P, Q, B, RB>, handler: MutatingRequestHandler<P, Q, B, RB>): void;
export function registerEndpoint<P, Q, B, RB>(app: Express, endpoint: MutatingMultiPartEndpoint<P, Q, B, RB>, handler: FileMutatingRequestHandler<P, Q, B, RB>): void;
export function registerEndpoint<P, Q, B, RB>(app: Express, endpoint: Endpoint<P, Q, B, RB>, handler: GetRequestHandler<P, Q, RB> | MutatingRequestHandler<P, Q, B, RB> | FileMutatingRequestHandler<P, Q, B, RB>): void {
    const expressHandler = async (req: ExpressRequest, res: ExpressResponse) => {
        try {
            const decoded = decodeRequest(req, endpoint);

            if (decoded.type === "failure") {
                return res.status(400).json({
                    code: 400,
                    message: decoded.error,
                });
            }

            if (decoded.value.type === "get") {
                const { params, query } = decoded.value;

                const result = await (handler as GetRequestHandler<P, Q, RB>)(params, query);
                return sendResponse(res, endpoint, result);
            } else if (decoded.value.type === "multipart") {
                const { params, query, body, files } = decoded.value;

                const result = await (handler as FileMutatingRequestHandler<P, Q, B, RB>)(params, query, body, files);
                return sendResponse(res, endpoint, result);
            } else {
                const { params, query, body } = decoded.value;

                const result = await (handler as MutatingRequestHandler<P, Q, B, RB>)(params, query, body);
                return sendResponse(res, endpoint, result);
            }
        } catch {
            return res.status(500).json({
                code: 500,
                message: "Internal server error",
            });
        }
    };

    const { request, method } = endpoint;

    const handlers: RequestHandler[] = [];

    if (method !== "GET") {
        if ("acceptedMimeTypes" in request) {
            const multerInstance = multer().any();
            handlers.push(multerInstance);
        } else {
            handlers.push(json({ limit: "10mb" }));
        }
    }

    handlers.push(expressHandler);

    switch (method) {
        case "GET":
            app.get(request.path, ...handlers);
            break;
        case "POST":
            app.post(request.path, ...handlers);
            break;
        case "PUT":
            app.put(request.path, ...handlers);
            break;
        case "DELETE":
            app.delete(request.path, ...handlers);
            break;
        case "PATCH":
            app.patch(request.path, ...handlers);
            break;
        default:
            const exhaustiveCheck: never = method;
            // @ts-ignore - This is to satisfy the exhaustive check, it should never be reached
            logger.warn(`Unsupported HTTP method: ${method}`);
    }
}