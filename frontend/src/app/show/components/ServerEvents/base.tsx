"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Warning from "../Warning";
import { Socket } from "socket.io-client";
import { useSocketFromRegistry } from "@frontend/app/components/SocketRegistry";

interface SocketIoProps {
    url: string;
    canonicalName: string;
    params?: { [key: string]: any; };
    isBundleable?: boolean;
    children?: React.ReactNode;
}

const SocketIoContext = createContext<Socket | null>(null);

export default function SocketProvider({ url, isBundleable, params, canonicalName, children }: SocketIoProps): React.JSX.Element {
    const socket = useSocketFromRegistry(url, isBundleable, params);
    const [connected, setConnected] = useState<boolean>(false);
    useEffect(() => {
        if (!socket) {
            return;
        }

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
            if (!socket) {
                return;
            }
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

export function useSocket(): Socket | null {
    return useContext(SocketIoContext);
}