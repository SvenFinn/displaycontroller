import { createIs, tags } from "typia";

export type Response<RB> = SuccessfulResponse<RB> | HttpError;

export type SuccessfulResponse<RB> = {
    code: Exclude<number & tags.Minimum<100> & tags.ExclusiveMaximum<300> & tags.MultipleOf<1>, 204 | 205>;
    body: RB;
} | NoBodySuccessfulResponse;

type NoBodySuccessfulResponse = {
    code: 204 | 205;
};

export type HttpError = {
    code: number & tags.Minimum<300> & tags.ExclusiveMaximum<600> & tags.MultipleOf<1>;
    message: string;
};

export const isResponse = createIs<Response<unknown>>();
export const isHttpError = createIs<HttpError>();

export { request } from "./request";
export { registerEndpoint } from "./handler";
export { Endpoint } from "./endpoint";