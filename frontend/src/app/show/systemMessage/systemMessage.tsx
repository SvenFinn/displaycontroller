"use client";

import { SystemMessageScreen } from "dc-screens-types";
import Ssmdb2Message from "./Ssmdb2";
import ServerIncompatibleMessage from "./ServerIncompatible";
import styles from "./systemMessage.module.css";
import { useEffect } from "react";
import InvalidScreen from "./InvalidScreen";
import SmdbAccess from "./smdbAccess";
import SizeWrapper from "../components/SizeWrapper";

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
        <SizeWrapper className={styles.systemMessage}>
            {getMessage(options)}
        </SizeWrapper>
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
            return <h1>Unknown system message</h1>
    }
}