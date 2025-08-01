"use client";

import { EvaluationScreen } from "dc-screens-types";
import styles from "./evaluation.module.css";
import { useEffect, useState } from "react";
import { useHost } from "@frontend/app/hooks/useHost";

interface EvaluationProps {
    options: EvaluationScreen["options"],
    onReady: () => void;
}

export default function Evaluation({ options, onReady }: EvaluationProps) {
    const host = useHost();

    const evaluationUrl = `${host}/api/evaluations/${options.path}`;
    return (
        <div className={styles.evaluation}>
            <iframe src={evaluationUrl} onLoad={onReady} className={styles.evaluation} />
        </div>
    )
}