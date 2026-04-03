import { GetEndpoint, isEmpty, MutatingEndpoint } from "dc-endpoints";
import { isRange, Range, RangeId, StartList } from "dc-ranges/types";
import { createIs } from "typia";

type GetRangesResponse = Array<RangeId>;

export const getActiveRanges: GetEndpoint<void, void, GetRangesResponse> = {
    method: "GET",
    request: {
        path: "/api/ranges",
        isParams: isEmpty,
        isQuery: isEmpty,
    }, response: {
        isResponseBody: createIs<GetRangesResponse>(),
    }
};

export const getFreeRanges: GetEndpoint<void, void, GetRangesResponse> = {
    method: "GET",
    request: {
        path: "/api/ranges/free",
        isParams: isEmpty,
        isQuery: isEmpty,
    }, response: {
        isResponseBody: createIs<GetRangesResponse>(),
    }
};

type GetByRangeId = { rangeId: string };

export const getRange: GetEndpoint<GetByRangeId, void, Range> = {
    method: "GET",
    request: {
        path: "/api/ranges/:rangeId",
        isParams: createIs<GetByRangeId>(),
        isQuery: isEmpty,
    }, response: {
        isResponseBody: isRange,
    }
};

type KnownRangeData = {
    macAddress: string;
    rangeId: number;
    lastIp: string;
};

type KnownRange = {
    createdAt: Date;
    updatedAt: Date;
} & KnownRangeData;

export const getAllKnownRanges: GetEndpoint<void, void, Array<KnownRange>> = {
    method: "GET",
    request: {
        path: "/api/ranges/known",
        isParams: isEmpty,
        isQuery: isEmpty,
    }, response: {
        isResponseBody: createIs<Array<KnownRange>>(),
    }
};

type GetKnownRangeByMac = { rangeMac: string };

export const getKnownRange: GetEndpoint<GetKnownRangeByMac, void, KnownRange> = {
    method: "GET",
    request: {
        path: "/api/ranges/known/:rangeMac",
        isParams: createIs<GetKnownRangeByMac>(),
        isQuery: isEmpty,
    }, response: {
        isResponseBody: createIs<KnownRange>(),
    }
};

type RangeIdentifier = { rangeId: RangeId };

export const createOrUpdateKnownRange: MutatingEndpoint<GetKnownRangeByMac, void, RangeIdentifier, KnownRange> = {
    method: "POST",
    request: {
        path: "/api/ranges/known/:rangeMac",
        isParams: createIs<GetKnownRangeByMac>(),
        isQuery: isEmpty,
        isBody: createIs<RangeIdentifier>(),
    }, response: {
        isResponseBody: createIs<KnownRange>(),
    }
};

export const deleteKnownRange: MutatingEndpoint<GetKnownRangeByMac, void, void, KnownRange> = {
    method: "DELETE",
    request: {
        path: "/api/ranges/known/:rangeMac",
        isParams: createIs<GetKnownRangeByMac>(),
        isQuery: isEmpty,
        isBody: createIs<void>(),
    }, response: {
        isResponseBody: createIs<KnownRange>(),
    }
};

export const getAllStartLists: GetEndpoint<void, void, Array<StartList>> = {
    method: "GET",
    request: {
        path: "/api/ranges/start-lists",
        isParams: isEmpty,
        isQuery: isEmpty,
    }, response: {
        isResponseBody: createIs<Array<StartList>>(),
    }
};