"use client";

import { EvaluationScreen } from "dc-screens/types";
import styles from "./evaluation.module.css";
import { useEffect, useState } from "react";
import { useHost } from "@frontend/app/hooks/useHost";

interface EvaluationProps {
    options: EvaluationScreen["options"],
    onReady: () => void;
}

export default function Evaluation({ options, onReady }: EvaluationProps) {
    const host = useHost();

    if (!host) {
        return "";
    }

    const evaluationUrl = new URL(options.path, host).toString();

    return (
        <div className={styles.evaluation}>
            <iframe src={evaluationUrl} onLoad={onReady} className={styles.evaluation} />
        </div>
    )
}