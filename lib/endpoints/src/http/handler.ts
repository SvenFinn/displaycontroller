import { isHttpError, isResponse, Response } from ".";
import { Express, Request as ExpressRequest, Response as ExpressResponse } from "express";
import { Endpoint, GetEndpoint, MutatingEndpoint } from "./endpoint";

export type MutatingRequestHandler<P extends object, Q extends object, B, RB> = (params: P, query: Q, body: B) => Promise<RB | Response<RB> | undefined>;
export type GetRequestHandler<P extends object, Q extends object, RB> = (params: P, query: Q) => Promise<RB | Response<RB> | undefined>;

export function registerEndpoint<P extends object, Q extends object, RB>(app: Express, endpoint: GetEndpoint<P, Q, RB>, handler: GetRequestHandler<P, Q, RB>): void;
export function registerEndpoint<P extends object, Q extends object, B, RB>(app: Express, endpoint: MutatingEndpoint<P, Q, B, RB>, handler: MutatingRequestHandler<P, Q, B, RB>): void;
export function registerEndpoint<P extends object, Q extends object, B, RB>(app: Express, endpoint: Endpoint<P, Q, B, RB>, handler: GetRequestHandler<P, Q, RB> | MutatingRequestHandler<P, Q, B, RB>): void {
    const { method, request } = endpoint;
    const expressHandler = async (req: ExpressRequest, res: ExpressResponse) => {
        const { params, query, body } = req;
        if (!request.isParams(params)) {
            res.status(400).send({
                code: 400,
                message: "Path parameters could not be validated",
            });
            return;
        }
        if (!request.isQuery(query)) {
            res.status(400).send({
                code: 400,
                message: "Query parameters could not be validated",
            });
            return;
        }
        if (method !== 'GET' && !request.isBody(body)) {
            res.status(400).send({
                code: 400,
                message: "Request body could not be validated",
            });
            return;
        }
        try {
            let result: RB | Response<RB> | void;
            if (method === 'GET') {
                const h = handler as GetRequestHandler<P, Q, RB>;
                result = await h(params, query);
            } else {
                const h = handler as MutatingRequestHandler<P, Q, B, RB>;
                result = await h(params, query, body);
            }

            if (result === undefined) {
                return res.status(204).send();
            }
            if (isResponse(result)) {
                if (isHttpError(result)) {
                    return res.status(result.code).json(result);
                }
                if (result.code === 204 || result.code === 205) {
                    return res.status(result.code).send();
                }
                if (!("body" in result)) {
                    return res.status(500).json({
                        code: 500,
                        message: "Response is missing body",
                    });
                }
                if (!endpoint.response.isResponseBody(result.body)) {
                    return res.status(500).json({
                        code: 500,
                        message: "Response body could not be validated",
                    });
                }
                return res.status(result.code).json(result.body);
            }

            if (endpoint.response.isResponseBody(result)) {
                return res.status(200).json(result);
            } else {
                return res.status(500).json({
                    code: 500,
                    message: "Response could not be validated",
                });
            }
        } catch (e) {
            if (isHttpError(e)) {
                res.status(e.code).send(e);
                return;
            }
            res.status(500).send({
                code: 500,
                message: "Internal server error",
            });
        }
    };
    switch (method) {
        case 'GET':
            app.get(request.path, expressHandler);
            break;
        case 'POST':
            app.post(request.path, expressHandler);
            break;
        case 'PUT':
            app.put(request.path, expressHandler);
            break;
        case 'DELETE':
            app.delete(request.path, expressHandler);
            break;
        case 'PATCH':
            app.patch(request.path, expressHandler);
            break;
    }
}