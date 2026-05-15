import { Response as ExpressResponse } from "express";
import { Endpoint } from "../endpoint.js";
import { Response, isResponse, isHttpError, HttpError } from "../index.js";

export function sendResponse<P, Q, B, RB>(res: ExpressResponse, endpoint: Endpoint<P, Q, B, RB>, result: RB | Response<RB> | undefined): ExpressResponse {
    if (result == null) {
        return res.sendStatus(204);
    }

    if (!isResponse(result)) {
        return sendBody(res, endpoint, result, 200);
    }

    if (isHttpError(result)) {
        return res.status(result.code).json(result);
    }

    if (result.code === 204 || result.code === 205) {
        return res.sendStatus(result.code);
    }

    return sendBody(res, endpoint, result.body, result.code);
}

function sendBody<P, Q, B, RB>(res: ExpressResponse, endpoint: Endpoint<P, Q, B, RB>, body: RB, code: number) {
    if (!endpoint.response.isResponseBody(body)) {
        const error: HttpError = {
            type: "error",
            code: 500,
            message: "Response body could not be validated",
        };
        return res.status(500).json(error);
    }

    return res.status(code).json(body);
}