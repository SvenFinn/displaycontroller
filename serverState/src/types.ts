export type AdvServerState = AdvServerStateOnline | AdvServerStateOffline;

type AdvServerStateOnline = {
    online: true;
    compatible: boolean;
    version: string;
    services: {
        ssmdb2: boolean;
        smdb: boolean;
    }
}

type AdvServerStateOffline = {
    online: false;
}