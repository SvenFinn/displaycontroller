"use client";

import { useEffect, useState } from "react";
import Warning from "../../Warning";
import { Socket } from "socket.io-client";

interface SocketIoProps {
    socket: Socket;
    canonicalName: string;
}

export default function SocketIoState({ socket, canonicalName }: SocketIoProps): React.JSX.Element {
    const [connected, setConnected] = useState<boolean>(false);
    useEffect(() => {

        function onConnect() {
            setConnected(true);
        }

        function onDisconnect() {
            setConnected(false);
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
    if (!connected) {
        return (
            <Warning>Warten auf Verbindung zum {canonicalName} Backend </Warning>
        )
    }
    return <></>;
}