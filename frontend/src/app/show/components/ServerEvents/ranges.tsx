"use client";

import { isRange, Range } from "dc-ranges/types";
import { useSocket } from "./base";
import SocketProvider from "./base";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useHost } from "@frontend/app/hooks/useHost";

export default function RangesProvider({ children, ranges }: { ranges: Array<number | null>, children: React.ReactNode }) {
    const params = useMemo(() => {
        const paramObj: { [key: string]: any } = {};
        paramObj["ranges"] = ranges.filter((r) => r !== null);
        return paramObj;
    }, [ranges]);
    const host = useHost();
    if (!host) {
        return <></>;
    }

    return (
        <SocketProvider canonicalName="Ranges" url={"/api/ranges"} params={params} isBundleable={false}>
            {children}
        </SocketProvider>
    )
}

export const useRangesSocket = useSocket;

export function useRangesCallback(action: ActionCreatorWithPayload<Range>) {
    const socket = useRangesSocket();
    const dispatch = useDispatch();


    useEffect(() => {
        if (!socket) {
            return;
        }
        console.log("Setting up ranges socket callback");
        function onData(data: any) {
            if (!isRange(data)) {
                return;
            }
            console.log("Received range data:", data);
            dispatch(action(data));
        }

        socket.on("data", onData);
        return () => {
            socket.off("data", onData);
        }
    }, [socket, action]);
}