"use client";

import { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

type SocketRcp = {
    socket: Socket;
    // simple mutable holder for last message (not a React ref)
    lastMessage: { current: any };
    referenceCount: number;
};

type SocketRegistryContext = Map<string, SocketRcp>;

const SocketRegistry = createContext<SocketRegistryContext>(new Map());

export function SocketRegistryProvider({ children }: { children: React.ReactNode }) {
    const registryRef = useRef<SocketRegistryContext>(new Map());
    return (
        <SocketRegistry.Provider value={registryRef.current}>
            {children}
        </SocketRegistry.Provider>
    );
}

/**
 * Hook to get a socket for a given URI.
 * If `isBundleable` is true the hook reuses a shared socket from the registry and reference-counts it.
 * Otherwise a private socket is created and disconnected on unmount.
 */
export function useSocketFromRegistry(uri: string, isBundleable: boolean = false): Socket {
    const registry = useContext(SocketRegistry);
    const localRef = useRef<Socket | null>(null);

    // Shared socket path
    if (isBundleable) {
        let entry = registry.get(uri);
        if (!entry) {
            entry = createSocketRcp(uri);
            registry.set(uri, entry);
        }

        // increment reference count and reuse socket
        entry.referenceCount += 1;
        localRef.current = entry.socket;

        useEffect(() => {
            return () => {
                // decrement reference count and cleanup if last
                const current = registry.get(uri);
                if (current) {
                    current.referenceCount -= 1;
                    if (current.referenceCount <= 0) {
                        try { current.socket.disconnect(); } catch (e) { /* ignore */ }
                        registry.delete(uri);
                    }
                }
            };
            // only depend on uri; registry identity is stable from provider
        }, [uri]);

        return localRef.current!;
    }

    // Per-hook socket (not shared)
    if (!localRef.current) {
        localRef.current = createSocket(uri);
    }

    useEffect(() => {
        return () => {
            try { localRef.current?.disconnect(); } catch (e) { /* ignore */ }
            localRef.current = null;
        };
    }, [uri]);

    return localRef.current!;
}

/** Hook to read last message stored in registry for a given uri (if any). */
export function useLastMessage(uri: string): any | null {
    const registry = useContext(SocketRegistry);
    const socketRcp = registry.get(uri);
    return socketRcp?.lastMessage.current ?? null;
}

function createSocketRcp(uri: string): SocketRcp {
    const socket = createSocket(uri);
    const lastMessage = { current: null };

    socket.on("data", (data: any) => {
        lastMessage.current = data;
    });

    return { socket, lastMessage, referenceCount: 0 };
}

function createSocket(uri: string): Socket {
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const port = isHttps
        ? process.env.NEXT_PUBLIC_HTTPS_PORT
        : process.env.NEXT_PUBLIC_APP_PORT;

    if (!uri.startsWith("/")) {
        uri = `/${uri}`;
    }

    return io(`http://localhost:${port}${uri}`, {
        path: `${uri}/ws/`,
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });
}