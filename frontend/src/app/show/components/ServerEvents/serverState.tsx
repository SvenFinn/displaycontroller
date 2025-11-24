"use client";

import { useSocket } from "./base";
import { useEffect, useState } from "react";
import SocketProvider from "./base";
import Warning from "../Warning";
import { useLastMessage } from "@frontend/app/components/SocketRegistry";

const SERVER_STATE_URI = "/api/serverState";

export function ServerStateProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
    return (
        <SocketProvider canonicalName="Server State" url={SERVER_STATE_URI} isBundleable={true}>
            {children}
        </SocketProvider>
    )
}

export default function ServerState(): React.JSX.Element {
    return (
        <SocketProvider canonicalName="Server State" url={SERVER_STATE_URI} isBundleable={true}>
            <ServerStateContent />
        </SocketProvider>
    )
}

function ServerStateContent(): React.JSX.Element {
    const lastMessage = useLastMessage(SERVER_STATE_URI);
    const [connected, setConnected] = useState<boolean>(lastMessage || false);
    const socket = useSocket();

    useEffect(() => {
        if (!socket) {
            return;
        }

        function onData(data: any) {
            if (typeof data !== "boolean") {
                return;
            }
            setConnected(data);
        }

        socket.on("data", onData);
        return () => {
            socket.off("data", onData);
        }
    }, [socket]);

    return (
        <>
            {connected ? <></> : <Warning level={900}>Keine Verbindung zum ShootMaster-Server verfügbar</Warning>}
        </>
    )
}