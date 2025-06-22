import { DirectoryListing, isDirectoryListing } from "@shared/files";
import { useEffect, useState } from "react";
import FileManager from "./FileManager";

export interface FileManagerBaseProps {
    readonly baseURL: URL;
    readonly readonly: boolean;
    readonly allowMultiSelect?: boolean;
    selectedFiles: string[];
    onSelect: (image: string) => void;
}

export default function FileManagerBase({ baseURL, readonly, allowMultiSelect, selectedFiles, onSelect }: FileManagerBaseProps) {
    const [files, setFiles] = useState<DirectoryListing>([]);

    async function refresh() {
        setFiles([]);
        const response = await fetch(new URL("", baseURL));
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
        refresh()
    }, []);

    function onOpen(path: string) {
        path = path.split("/").map(encodeURIComponent).join("/");
        window.open(new URL(path, baseURL), "_blank");
    }

    async function onDownload(files: string[], setPercentage: (percentage: number) => void, setMessage: (message: string) => void) {
        for (let i = 0; i < files.length; i++) {
            setMessage(`Downloading ${files[i]}`);
            const file = files[i].split("/").map(encodeURIComponent).join("/");
            const response = await fetch(new URL(file, baseURL));
            if (!response.ok) {
                throw new Error("Failed to download file");
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.split("/").pop() || "download";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setPercentage(Math.round(((i + 1) / files.length) * 100));
        }
    }

    async function onCreateFolder(path: string, setPercentage: (percentage: number) => void, setMessage: (message: string) => void) {
        path = path.split("/").map(encodeURIComponent).join("/");
        setMessage(`Creating folder ${path}`);
        const response = await fetch(new URL(path, baseURL), {
            method: "POST",
        });
        if (!response.ok) {
            throw new Error("Failed to create folder");
        }
    }

    async function onDelete(files: string[], setPercentage: (percentage: number) => void, setMessage: (message: string) => void) {
        for (let i = 0; i < files.length; i++) {
            setMessage(`Deleting ${files[i]}`);
            const file = files[i].split("/").map(encodeURIComponent).join("/");
            const response = await fetch(new URL(file, baseURL), {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete file");
            }
            setPercentage(Math.round(((i + 1) / files.length) * 100));
        }
    }

    async function onRename(oldPath: string, newPath: string, setPercentage: (percentage: number) => void, setMessage: (message: string) => void) {
        setMessage(`Renaming ${oldPath} to ${newPath}`);
        oldPath = oldPath.split("/").map(encodeURIComponent).join("/");
        const response = await fetch(new URL(oldPath, baseURL), {
            method: "PUT",
            body: JSON.stringify({ destination: newPath, mode: "move" }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Failed to rename file");
        }
    }

    async function onMove(files: string[], destination: string, setPercentage: (percentage: number) => void, setMessage: (message: string) => void) {
        for (let i = 0; i < files.length; i++) {
            setMessage(`Moving ${files[i]} to ${destination}`);
            const file = files[i];
            const encodedFile = file.split("/").map(encodeURIComponent).join("/");
            const response = await fetch(`${baseURL}/${encodedFile}`, {
                method: "PUT",
                body: JSON.stringify({ destination: `${destination}/${file.split("/").pop()}`, mode: "move" }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("Failed to move file");
            }
            setPercentage(Math.round(((i + 1) / files.length) * 100));
        }
    }

    async function onCopy(files: string[], destination: string, setPercentage: (percentage: number) => void, setMessage: (message: string) => void) {
        for (let i = 0; i < files.length; i++) {
            setMessage(`Copying ${files[i]} to ${destination}`);
            const file = files[i];
            const encodedFile = file.split("/").map(encodeURIComponent).join("/");
            const response = await fetch(new URL(encodedFile, baseURL), {
                method: "PUT",
                body: JSON.stringify({ destination: `${destination}/${file.split("/").pop()}`, mode: "copy" }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
            );
            if (!response.ok) {
                throw new Error("Failed to copy file");
            }
            setPercentage(Math.round(((i + 1) / files.length) * 100));
        }
    }

    async function onUpload(files: FileList, destination: string, setPercentage: (percentage: number) => void, setMessage: (message: string) => void): Promise<void> {
        return new Promise(async (resolve, reject) => {
            setMessage(`Uploading ${files.length} files`);
            setPercentage(0);
            const formdata = new FormData();
            for (let i = 0; i < files.length; i++) {
                formdata.append("file", files[i]);
            }
            destination = destination.split("/").map(encodeURIComponent).join("/");
            const request = new XMLHttpRequest();
            request.open("POST", new URL(destination, baseURL));
            request.onload = () => {
                if (request.status === 200) {
                    resolve();
                } else {
                    reject(new Error("Failed to upload file"));
                }
            };
            request.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    if (percentComplete === 100) {
                        setMessage(`Processing ${files.length} files`);
                    }
                    setPercentage(Math.round(percentComplete));
                }
            }
            request.onerror = () => {
                reject(new Error("Network error"));
            };
            request.send(formdata);
        });
    }

    const operations = readonly ? {
        onOpen: onOpen,
        onDownload: onDownload,
        onRefresh: refresh,
    } : {
        onOpen: onOpen,
        onDownload: onDownload,
        onRefresh: refresh,
        onCreateFolder: onCreateFolder,
        onDelete: onDelete,
        onRename: onRename,
        onMove: onMove,
        onCopy: onCopy,
        onUpload: onUpload,
    };


    return (
        <FileManager files={files} initialPath={getCommonPath(selectedFiles)} onSelect={onSelect} {...operations} allowMultiSelect={allowMultiSelect} />
    )
}

function getCommonPath(files: string[]): string {
    if (files.length === 0) return "";
    const paths = files.map(file => file.split("/"));
    const commonPath = paths[0];
    for (let i = 1; i < paths.length; i++) {
        let j = 0;
        while (j < commonPath.length && j < paths[i].length && commonPath[j] === paths[i][j]) {
            j++;
        }
        commonPath.length = j;
    }
    return commonPath.join("/");
}