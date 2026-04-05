import { createIs, tags } from "typia";

export type Response<RB> = SuccessfulResponse<RB> | HttpError;

export type SuccessfulResponse<RB> = {
    type: "success";
    code: number & tags.Minimum<200> & tags.ExclusiveMaximum<300> & tags.MultipleOf<1>;
    body: RB | null;
}

export type HttpError = {
    type: "error";
    code: number & tags.Minimum<300> & tags.ExclusiveMaximum<600> & tags.MultipleOf<1>;
    message: string;
};

export const isResponse = createIs<Response<unknown>>();
export const isHttpError = createIs<HttpError>();

export { request } from "./request.js";
export { registerEndpoint } from "./handler.js";
export { GetEndpoint, MutatingEndpoint } from "./endpoint.js";