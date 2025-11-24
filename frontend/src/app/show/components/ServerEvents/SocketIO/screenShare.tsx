"use client";

import SocketProvider, { useSocket } from "./base";

export function ScreenShareSocketProvider({ children }: { children: React.ReactNode }) {
    return (
        <SocketProvider canonicalName="ScreenShare" url="/api/screenCast" isBundleable={false}>
            {children}
        </SocketProvider>
    );
}

export function useScreenShareSocket() {
    return useSocket();
}