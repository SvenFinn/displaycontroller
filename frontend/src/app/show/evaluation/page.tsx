"use client";

import ColumnResize from "@frontend/app/components/ColumnResize";
import FolderTree from "@frontend/app/components/FileManagerNew/FolderTree";
import { useEffect, useState } from "react";
import { DirectoryListing, isDirectoryListing } from "@shared/files";
import FileList from "@frontend/app/components/FileManagerNew/FileList";
import FileManager from "@frontend/app/components/FileManagerNew";

export default function Page() {
    const [files, setFiles] = useState<DirectoryListing>([]);

    async function refresh() {
        setFiles([]);
        const response = await fetch("http://localhost:80/api/images");
        if (!response.ok) {
            throw new Error("Failed to fetch files");
        }
        const data = await response.json();
        if (!isDirectoryListing(data)) {
            throw new Error("Invalid data format");
        }
        setFiles(data);
    }

    useEffect(() => {
        refresh();
    }, []);

    function onOpen(path: string) {
        window.open(`http://localhost:80/api/images/${path}`, "_blank");
    }

    return (
        <FileManager files={files} initialPath="" onSelect={() => { }} onOpen={onOpen} onRefresh={refresh} />
    )
}