import { useEffect, useState } from "react";

export function useHost(): string {
    const [host, setHost] = useState<string>("");

    useEffect(() => {
        const protocol = window.location.protocol;
        const port = protocol === "https:" ? process.env.NEXT_PUBLIC_HTTPS_PORT :
            process.env.NEXT_PUBLIC_APP_PORT;
        if (!port) {
            throw new Error("Port is not defined in environment variables");
        }
        setHost(`${protocol}//${window.location.host.split(":")[0]}:${port}`);
    }, []);

    return host;
}