export type Endpoint<P, Q, B, RB> = MutatingEndpoint<P, Q, B, RB> | GetEndpoint<P, Q, RB>;

export type MutatingEndpoint<P, Q, B, RB> = {
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    request: MutatingEndpointRequest<P, Q, B>;
    response: EndpointResponse<RB>;
};

export type GetEndpoint<P, Q, RB> = {
    method: 'GET';
    request: GetEndpointRequest<P, Q>;
    response: EndpointResponse<RB>;
}

export type GetEndpointRequest<P, Q> = {
    path: string;
    isParams: (input: unknown) => input is P;
    isQuery: (input: unknown) => input is Q;
};
export type MutatingEndpointRequest<P, Q, B> = GetEndpointRequest<P, Q> & {
    isBody: (input: unknown) => input is B;
};

export type EndpointResponse<RB> = {
    isResponseBody: (input: unknown) => input is RB;
};