import { GetEndpoint, isEmpty } from "dc-endpoints";
import { createIs } from "typia";
import { AdvServerState, ServerCompatible } from "../types/index.js";

export const getServerState: GetEndpoint<void, void, ServerCompatible> = {
    method: "GET",
    request: {
        path: "/api/serverState",
        isParams: isEmpty,
        isQuery: isEmpty,
    },
    response: {
        isResponseBody: createIs<ServerCompatible>(),
    }
};

export const getFullServerState: GetEndpoint<void, void, AdvServerState> = {
    method: "GET",
    request: {
        path: "/api/serverState/full",
        isParams: isEmpty,
        isQuery: isEmpty,
    },
    response: {
        isResponseBody: createIs<AdvServerState>(),
    }
};
