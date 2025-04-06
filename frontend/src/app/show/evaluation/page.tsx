"use client";

import ColumnResize from "@frontend/app/components/ColumnResize";
import FolderTree from "@frontend/app/components/FolderTree";
import { useEffect, useState } from "react";
import { DirectoryListing, isDirectoryListing } from "@shared/files";
import FileList from "@frontend/app/components/FileList";

export default function Page() {
    const [selectedPath, setSelectedPath] = useState<string>("");
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

    console.log(selectedPath);
    return (
        <ColumnResize initialSizes={[20, 80]} style={{ backgroundColor: "white" }}>
            <FolderTree files={files} currentPath={selectedPath} onSelect={(path: string) => { setSelectedPath(path) }} />
            <FileList files={files} currentPath={selectedPath} onPathChange={(path: string) => { setSelectedPath(path) }} onSelect={(path: string) => {
                alert(`Selected file: ${path}`)

            }} />
        </ColumnResize>
    )
}