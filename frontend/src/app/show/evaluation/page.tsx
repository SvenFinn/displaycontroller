"use client";

import ColumnResize from "@frontend/app/components/ColumnResize";
import FolderTree from "@frontend/app/components/FolderTree";
import { useEffect, useState } from "react";
import { DirectoryListing, isDirectoryListing } from "@shared/files";
import FileList from "@frontend/app/components/FileList";
import FileManager from "@frontend/app/components/FileManagerNew";

export default function Page() {
    const [files, setFiles] = useState<DirectoryListing>([]);

    useEffect(() => {
        async function fetchFiles() {
            const response = await fetch("http://localhost:80/api/images");
            if (!response.ok) {
                alert("Failed to fetch files");
                return;
            }
            const data = await response.json();
            if (!isDirectoryListing(data)) {
                alert("Invalid data format");
                return;
            }
            setFiles(data);
        }
        fetchFiles();
    }, []);

    function onOpen(path: string) {
        window.open(`http://localhost:80/api/images/${path}`, "_blank");
    }

    return (
        <FileManager files={files} initialPath="" onSelect={() => { }} onOpen={onOpen} />
    )
}