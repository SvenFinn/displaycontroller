"use client";

import ServerEvents from "./base";
import Warning from "../Warning";
import { useCallback, useEffect, useState } from "react";
import { useHost } from "@frontend/app/hooks/useHost";

export default function ServerState(): React.JSX.Element {
    const [connected, setConnected] = useState<boolean>(false);
    const host = useHost();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actionCallback = useCallback((data: any) => {
        if (typeof data !== "boolean") {
            return;
        }
        setConnected(data);
    }, []);

    if (!host) {
        return <></>;
    }

    const path = `${host}/api/serverState/sse`;
    return (
        <>
            <ServerEvents path={path} canonicalName="Server State" action={actionCallback} />
            {connected ? <></> : <Warning level={900}>Keine Verbindung zum Meyton-Server verfügbar</Warning>}
        </>
    )
}
