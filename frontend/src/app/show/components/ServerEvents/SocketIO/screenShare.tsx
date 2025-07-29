"use client";

import { io } from "socket.io-client";
import SocketIoState from "./base";
import { useEffect } from "react";


export const socket = io(`:${process.env.NEXT_PUBLIC_APP_PORT}`, {
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
    return (
        <SocketIoState
            socket={socket}
            canonicalName="ScreenShare" />
    )
}