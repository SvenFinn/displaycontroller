type Validator<T> = (input: unknown) => input is T;

export type Endpoint<P, Q, B, RB> = MutatingEndpoint<P, Q, B, RB> | MutatingMultiPartEndpoint<P, Q, B, RB> | GetEndpoint<P, Q, RB>;

export type MutatingEndpoint<P, Q, B, RB> = {
    method: "POST" | "PUT" | "DELETE" | "PATCH";
    request: EndpointMutatingRequest<P, Q, B>;
    response: EndpointResponse<RB>;
};

export type MutatingMultiPartEndpoint<P, Q, B, RB> = {
    method: "POST" | "PUT" | "DELETE" | "PATCH";
    request: EndpointMultiPartRequest<P, Q, B>;
    response: EndpointResponse<RB>;
};

export type GetEndpoint<P, Q, RB> = {
    method: "GET";
    request: EndpointBaseRequest<P, Q>;
    response: EndpointResponse<RB>;
};

export type EndpointResponse<B> = {
    isResponseBody: Validator<B>;
};

export type EndpointBaseRequest<P, Q> = {
    path: string;
    isParams: Validator<P>;
    isQuery: Validator<Q>;
};

export type EndpointMutatingRequest<P, Q, B> = EndpointBaseRequest<P, Q> & {
    isBody: Validator<B>;
};

export type EndpointMultiPartRequest<P, Q, B> = EndpointMutatingRequest<P, Q, B> & {
    acceptedMimeTypes: Array<string> // List of mime types 
};

