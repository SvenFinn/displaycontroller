"use client";

import { useEffect, useState } from "react";
import { DirectoryListing, isDirectoryListing } from "@shared/files";
import FileManager from "@frontend/app/components/FileManager";

export default function Page() {
    const [host, setHost] = useState<string>("");
    const [files, setFiles] = useState<DirectoryListing>([]);

    useEffect(() => {
        setHost(window.location.host.split(":")[0]);
    }, []);
    const baseURL = `http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/images`;

    async function refresh() {
        setFiles([]);
        const response = await fetch(`${baseURL}/`);
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
        if (host === "") {
            return;
        }
        refresh();
    }, [host]);

    if (host === "") {
        return <></>;
    }

    function onOpen(path: string) {
        window.open(`${baseURL}/${path}`, "_blank");
    }

    async function onDownload(files: string[], setPercentage: (percentage: number) => void, setMessage: (message: string) => void) {
        for (let i = 0; i < files.length; i++) {
            setMessage(`Downloading ${files[i]}`);
            const file = files[i];
            const response = await fetch(`${baseURL}/${file}`);
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
        setMessage(`Creating folder ${path}`);
        const response = await fetch(`${baseURL}/${path}`, {
            method: "POST",
        });
        if (!response.ok) {
            throw new Error("Failed to create folder");
        }
    }

    async function onDelete(files: string[], setPercentage: (percentage: number) => void, setMessage: (message: string) => void) {
        for (let i = 0; i < files.length; i++) {
            setMessage(`Deleting ${files[i]}`);
            const file = files[i];
            const response = await fetch(`${baseURL}/${file}`, {
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
        const response = await fetch(`${baseURL}/${oldPath}`, {
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
            const response = await fetch(`${baseURL}/${file}`, {
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
            const response = await fetch(`${baseURL}/${file}`, {
                method: "PUT",
                body: JSON.stringify({ destination: `${destination}/${file.split("/").pop()}`, mode: "copy" }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
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
            const request = new XMLHttpRequest();
            request.open("POST", `${baseURL}/${destination}`);
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

    return (
        <FileManager files={files} initialPath="" onSelect={() => { }} onOpen={onOpen} onRefresh={refresh} onDownload={onDownload} onCreateFolder={onCreateFolder} onDelete={onDelete} onRename={onRename} onMove={onMove} onCopy={onCopy} onUpload={onUpload} />
    )
}