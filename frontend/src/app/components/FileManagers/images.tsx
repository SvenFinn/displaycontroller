import { useEffect, useState } from "react";
import FileManagerBase from "./base";
import { useHost } from "@frontend/app/hooks/useHost";


export interface ImageManagerProps {
    selectedFiles?: string[];
    onSelect?: (files: string) => void;
    allowMultiSelect?: boolean;
}


export default function ImageManager({ selectedFiles = [], onSelect = () => { }, allowMultiSelect = true }: ImageManagerProps) {
    const host = useHost();

    return (
        <FileManagerBase
            baseURL={`${host}/api/images/`}
            readonly={false}
            allowMultiSelect={allowMultiSelect}
            selectedFiles={selectedFiles}
            onSelect={onSelect}
        />
    )
}
