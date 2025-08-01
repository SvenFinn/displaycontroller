"use client";

import { useEffect, useState } from "react";
import Warning from "../Warning";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServerEventsCallback = (data: any) => void;

interface ServerEventsProps {
    path: URL | string;
    canonicalName: string;
    action: ServerEventsCallback;
}

export default function ServerEvents({ path, canonicalName, action }: ServerEventsProps): React.JSX.Element {
    const [connected, setConnected] = useState<boolean>(false);
    useEffect(() => {
        let eventSource: EventSource;

        createEventSource();

        function createEventSource() {
            eventSource = new EventSource(path);
            eventSource.onopen = () => {
                setConnected(true);
            }
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                action(data);
            }
            eventSource.onerror = () => {
                setConnected(false);
                eventSource.close();
                setTimeout(() => {
                    createEventSource();
                }, 5000);
            }
        }

        return () => {
            eventSource.close();
            setConnected(false);
        }

    }, [path, canonicalName, action]);
    if (!connected) {
        return (
            <Warning>Warten auf Verbindung zum {canonicalName} Backend </Warning>
        )
    }
    return <></>;
}