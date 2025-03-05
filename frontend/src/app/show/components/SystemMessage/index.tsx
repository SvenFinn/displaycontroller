"use client";

import { SystemMessageScreen } from "@shared/screens/systemMessage";
import Ssmdb2Message from "./Ssmdb2";
import ServerIncompatibleMessage from "./ServerIncompatible";
import styles from "./systemMessage.module.css";
import { useEffect } from "react";

interface SystemMessageProps {
    options: SystemMessageScreen["options"];
    onReady?: () => void;
}

export default function SystemMessage({ options, onReady }: SystemMessageProps) {
    useEffect(() => {
        if (!onReady) return;
        const timeout = setTimeout(onReady, 750);
        return () => clearTimeout(timeout);
    }, [onReady]);
    return (
        <div className={styles.systemMessage}>
            {getMessage(options)}
        </div>
    )
}

function getMessage(options: SystemMessageScreen["options"]) {
    switch (options.type) {
        case "ssmdb2":
            return <Ssmdb2Message />
        case "serverIncompatible":
            return <ServerIncompatibleMessage serverVersion={options.serverVersion} />
        default:
            return <h1>Unknown system message</h1>
    }
}