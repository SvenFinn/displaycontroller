"use client";

import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useSocket } from "./base";
import SocketProvider from "./base";
import { isScreen, Screen } from "dc-screens-types";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLastMessage } from "@frontend/app/components/SocketRegistry";

export default function ScreensProvider({ children }: { children: React.ReactNode }) {
    return (
        <SocketProvider canonicalName="Screens" url="/api/screens" isBundleable={true}>
            {children}
        </SocketProvider>
    )
}

export const useScreensSocket = useSocket;

export function useScreensCallback(action: ActionCreatorWithPayload<Screen>) {
    const socket = useScreensSocket();
    const dispatch = useDispatch();
    const lastMessage = useLastMessage("/api/screens");

    useEffect(() => {
        if (!socket) {
            return;
        }
        onData(lastMessage);

        function onData(data: any) {
            if (!isScreen(data)) {
                return;
            }
            dispatch(action(data));
        }

        socket.on("data", onData);
        return () => {
            socket.off("data", onData);
        }
    }, [socket, action]);
}
