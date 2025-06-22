import { useEffect, useState } from "react";
import FileManagerBase from "./base";


export interface ImageManagerProps {
    selectedFiles?: string[];
    onSelect?: (files: string) => void;
    allowMultiSelect?: boolean;
}


export default function ImageManager({ selectedFiles = [], onSelect = () => { }, allowMultiSelect = true }: ImageManagerProps) {
    const [host, setHost] = useState<string>();

    useEffect(() => {
        setHost(window.location.host.split(":")[0]);
    }, []);

    if (!host) {
        return <div>Loading...</div>;
    }

    return (
        <FileManagerBase
            baseURL={new URL(`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/images/`)}
            readonly={false}
            allowMultiSelect={allowMultiSelect}
            selectedFiles={selectedFiles}
            onSelect={onSelect}
        />
    )
}
