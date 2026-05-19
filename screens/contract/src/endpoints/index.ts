import { GetEndpoint, isEmpty } from "dc-endpoints";
import { DirectoryListing } from "../files/index.js";
import { createIs } from "typia";

type FileQueryParams = {
    pathSegments: string[] | undefined;
};

export const getEvaluations: GetEndpoint<FileQueryParams, void, DirectoryListing> = {
    method: "GET",
    request: {
        path: "/api/evaluations/meta{/*pathSegments}",
        isParams: createIs<FileQueryParams>(),
        isQuery: isEmpty,
    }, response: {
        isResponseBody: createIs<DirectoryListing>(),
    }
};

