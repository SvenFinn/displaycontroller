import { useEffect, useState } from "react";
import FileManagerBase from "./base";
import { useHost } from "@frontend/app/hooks/useHost";


export interface EvaluationManagerProps {
    selectedFiles?: string[];
    onSelect?: (file: string) => void;
    allowMultiSelect?: boolean;
}


export default function EvaluationManager({ selectedFiles = [], onSelect = () => { }, allowMultiSelect = true }: EvaluationManagerProps) {
    const host = useHost();

    return (
        <FileManagerBase
            baseURL={`${host}/api/evaluations`}
            readonly={true}
            allowMultiSelect={allowMultiSelect}
            selectedFiles={selectedFiles}
            onSelect={onSelect}
        />
    )
}
