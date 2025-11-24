"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Warning from "../../Warning";
import { Socket } from "socket.io-client";
import { useSocketFromRegistry } from "@frontend/app/components/SocketRegistry";

interface SocketIoProps {
    url: string;
    canonicalName: string;
    isBundleable?: boolean;
    children?: React.ReactNode;
}

const SocketIoContext = createContext<Socket | null>(null);

export default function SocketProvider({ url, isBundleable, canonicalName, children }: SocketIoProps): React.JSX.Element {
    const socket = useSocketFromRegistry(url, isBundleable);
    const [connected, setConnected] = useState<boolean>(false);
    useEffect(() => {

        function onDisconnect() {
            setConnected(false);
        }

        function onConnect() {
            setConnected(true);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        setConnected(socket.connected);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            setConnected(false);
        }

    }, [socket]);

    return (
        <SocketIoContext.Provider value={socket}>
            {children}
            {!connected && (<Warning>Warten auf Verbindung zum {canonicalName} Backend </Warning>)}
        </SocketIoContext.Provider>
    );
}

export function useSocket(): Socket {
    const socket = useContext(SocketIoContext);
    if (!socket) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return socket;
}