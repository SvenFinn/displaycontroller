import { useEffect, useState } from "react";

export function useHost(): string {
    const [host, setHost] = useState<string>("");

    useEffect(() => {
        setHost(getHost());
    }, []);

    return host;
}

export function getHost(): string {
    const protocol = window.location.protocol;
    const port = protocol === "https:" ? process.env.NEXT_PUBLIC_HTTPS_PORT :
        process.env.NEXT_PUBLIC_APP_PORT;
    if (!port) {
        throw new Error("Port is not defined in environment variables");
    }
    return `${protocol}//${window.location.host.split(":")[0]}:${port}`;
}