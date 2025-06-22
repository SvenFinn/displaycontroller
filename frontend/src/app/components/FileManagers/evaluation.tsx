import { useEffect, useState } from "react";
import FileManagerBase from "./base";


export interface EvaluationManagerProps {
    selectedFiles?: string[];
    onSelect?: (file: string) => void;
    allowMultiSelect?: boolean;
}


export default function EvaluationManager({ selectedFiles = [], onSelect = () => { }, allowMultiSelect = true }: EvaluationManagerProps) {
    const [host, setHost] = useState<string>();

    useEffect(() => {
        setHost(window.location.host.split(":")[0]);
    }, []);

    if (!host) {
        return <div>Loading...</div>;
    }

    return (
        <FileManagerBase
            baseURL={new URL(`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/evaluations/`)}
            readonly={true}
            allowMultiSelect={allowMultiSelect}
            selectedFiles={selectedFiles}
            onSelect={onSelect}
        />
    )
}
