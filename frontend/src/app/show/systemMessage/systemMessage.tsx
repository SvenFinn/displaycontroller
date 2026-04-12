"use client";

import { SystemMessageScreen } from "dc-screens-types";
import Ssmdb2Message from "./Ssmdb2";
import ServerIncompatibleMessage from "./ServerIncompatible";
import styles from "./systemMessage.module.css";
import { useEffect } from "react";
import InvalidScreen from "./InvalidScreen";
import SmdbAccess from "./smdbAccess";
import { HeightAsFontSize } from "@frontend/app/components/base/BoundingBoxCss";

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
        <HeightAsFontSize className={styles.systemMessage}>
            {getMessage(options)}
        </HeightAsFontSize>
    )
}

function getMessage(options: SystemMessageScreen["options"]) {
    switch (options.type) {
        case "ssmdb2":
            return <Ssmdb2Message />
        case "serverIncompatible":
            return <ServerIncompatibleMessage serverVersion={options.serverVersion} />
        case "invalidScreen":
            return <InvalidScreen id={options.id} type={options.screenType} />
        case "SMDBAccess":
            return <SmdbAccess />
        default:
            const exhaustiveCheck: never = options;
            // @ts-ignore - This is to satisfy the exhaustive check, it should never be reached
            console.warn(`No message component defined for system message type: ${options.type}`);
            return <h1>Unknown system message</h1>
    }
}