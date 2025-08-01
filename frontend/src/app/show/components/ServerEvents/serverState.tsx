"use client";

import ServerEvents from "./base";
import Warning from "../Warning";
import { useEffect, useState } from "react";

export default function ServerState(): React.JSX.Element {
    const [host, setHost] = useState<string>("");
    const [connected, setConnected] = useState<boolean>(false);

    useEffect(() => {
        setHost(window.location.host.split(":")[0]);
    }, []);

    if (host === "") {
        return <></>;
    }

    const path = new URL(`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/serverState/sse`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function actionCallback(data: any) {
        if (typeof data !== "boolean") {
            return;
        }
        setConnected(data);
    }
    return (
        <>
            <ServerEvents path={path} canonicalName="Server State" action={actionCallback} />
            {connected ? <></> : <Warning level={900}>Keine Verbindung zum Meyton-Server verfügbar</Warning>}
        </>
    )
}
