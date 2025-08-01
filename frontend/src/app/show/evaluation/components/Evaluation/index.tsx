"use client";

import { EvaluationScreen } from "@shared/screens/evaluation";
import styles from "./evaluation.module.css";
import { useEffect, useState } from "react";

interface EvaluationProps {
    options: EvaluationScreen["options"],
    onReady: () => void;
}

export default function Evaluation({ options, onReady }: EvaluationProps) {
    const [host, setHost] = useState<string>("");
    useEffect(() => {
        setHost(window.location.host);
    }, []);

    if (host === "") {
        return <></>;
    }

    const hostWithoutPort = host.split(":")[0];
    const evaluationUrl = `http://${hostWithoutPort}:${process.env.NEXT_PUBLIC_APP_PORT}/api/evaluations/${options.file}`;
    return (
        <div className={styles.evaluation}>
            <iframe src={evaluationUrl} onLoad={onReady} className={styles.evaluation} />
        </div>
    )
}