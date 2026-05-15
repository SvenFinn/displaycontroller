import { EndpointResponse } from "../endpoint.js";
import { isHttpError, Response as LibResponse } from "../index.js";

export async function decodeResponse<RB>(result: Response, response: EndpointResponse<RB>): Promise<LibResponse<RB>> {
    if (result.ok) {
        if (result.status === 204 || result.status === 205) {
            return {
                type: "success",
                code: result.status,
                body: null,
            };
        }
        let responseBody: unknown;
        try {
            responseBody = await result.json();
        } catch (e) {
            return {
                type: "error",
                code: 500,
                message: "Response body is not valid JSON",
            };
        }
        if (response.isResponseBody(responseBody)) {
            return {
                type: "success",
                code: result.status,
                body: responseBody,
            };
        } else {
            return {
                type: "error",
                code: 500,
                message: "Response body could not be validated locally",
            };
        }
    } else {
        try {
            const errorBody = await result.json();
            if (!isHttpError(errorBody)) {
                return {
                    type: "error",
                    code: result.status,
                    message: result.statusText,
                };
            }
            return errorBody;
        } catch (e) {
            return {
                type: "error",
                code: result.status,
                message: result.statusText,
            };
        }
    }
}