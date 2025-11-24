"use client";

import { createContext, useContext, useEffect, useRef, useState } from 'react';
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
export function useSocketFromRegistry(uri: string, isBundleable: boolean = false, params?: { [key: string]: any; }): Socket | null {
    const registry = useContext(SocketRegistry);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Shared socket path
    if (isBundleable) {
        useEffect(() => {
            let entry = registry.get(uri);
            if (!entry) {
                entry = createSocketRcp(uri, params);
                registry.set(uri, entry);
            }

            // increment reference count and reuse socket
            entry.referenceCount += 1;
            setSocket(entry.socket);

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
        }, [uri]);;
    } else {
        useEffect(() => {
            console.log("creating unshared socket for uri", uri);
            setSocket(createSocket(uri, params));
            return () => {
                console.log("disconnecting unshared socket for uri", uri);
                try { socket?.disconnect(); } catch (e) { /* ignore */ }
            };
        }, [uri]);
    }
    return socket
}

/** Hook to read last message stored in registry for a given uri (if any). */
export function useLastMessage(uri: string): any | null {
    const registry = useContext(SocketRegistry);
    const socketRcp = registry.get(uri);
    return socketRcp?.lastMessage.current ?? null;
}

function createSocketRcp(uri: string, params?: { [key: string]: any; }): SocketRcp {
    const socket = createSocket(uri, params);
    const lastMessage = { current: null };

    socket.on("data", (data: any) => {
        lastMessage.current = data;
    });

    return { socket, lastMessage, referenceCount: 0 };
}

function createSocket(uri: string, params?: { [key: string]: any; }): Socket {
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const port = isHttps
        ? process.env.NEXT_PUBLIC_HTTPS_PORT
        : process.env.NEXT_PUBLIC_APP_PORT;

    if (!uri.startsWith("/")) {
        uri = `/${uri}`;
    }

    // map params to json stringify
    const query: { [key: string]: any } = {};
    if (params) {
        for (const key of Object.keys(params)) {
            query[key] = JSON.stringify(params[key]);
        }
    }

    return io(`:${port}${uri}`, {
        path: `${uri}/ws/`,
        query: query,
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });
}