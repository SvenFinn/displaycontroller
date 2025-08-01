"use client";

import { io } from "socket.io-client";
import SocketIoState from "./base";
import { useEffect } from "react";


// Determine protocol and port dynamically
const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
const port = isHttps
    ? process.env.NEXT_PUBLIC_HTTPS_PORT
    : process.env.NEXT_PUBLIC_APP_PORT;

const socket = io(`:${port}`, {
    path: "/api/screenCast/ws/",
    autoConnect: false,
});

let refCount = 0;

export function useScreenShareSocket() {
    useEffect(() => {
        refCount++;
        return releaseScreenShareSocket
    }, []);

    if (!socket.connected) {
        socket.connect();
    }
    return socket;
}

export function releaseScreenShareSocket() {
    refCount--;
    if (refCount <= 0) {
        refCount = 0;
        if (socket.connected) {
            socket.disconnect();
        }
    }
}

export function ScreenShareSocketState() {
    const socket = useScreenShareSocket();
    return (
        <SocketIoState
            socket={socket}
            canonicalName="ScreenShare" />
    )
}