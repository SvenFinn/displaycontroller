import { DirectoryListing, Folder } from "@shared/files";
import styles from "./FileList.module.css";
import FileListEntry from "./FileListEntry";
import BreadCrumb from "./BreadCrumb";
import { useState } from "react";
import ContextMenu from "./ContextMenu";
import { InternalActions } from "../Actions/hook";


type FileListProps = {
    files: DirectoryListing;
    currentPath: string;
    selectedFiles: string[];
    onPathChange(path: string): void;
    onSelect(path: string): void;
    onOpen(path: string): void;
    contextActions: InternalActions;
}


export default function FileList({ files, currentPath, selectedFiles, onPathChange, onSelect, onOpen, contextActions }: FileListProps) {
    const [contextOpen, setContextOpen] = useState(false);
    const [contextPosition, setContextPosition] = useState({ x: 0, y: 0 });

    const path = currentPath.split("/").filter((part) => part !== "").join("/");
    const entries = getEntriesOfPath(files, path);
    const folderList = entries.filter((entry) => entry.type === "folder") as Folder[];
    const fileList = entries.filter((entry) => entry.type === "file");
    const list = [...folderList, ...fileList];

    function fileEntryOnOpen(path: string) {
        const pathName = path.split("/").pop();
        const file = list.find((file) => file.name === pathName);
        if (file && file.type === "folder") {
            onPathChange(path);
        } else {
            onOpen(path);
        }
    }

    function onContextMenu(x: number, y: number) {
        setContextOpen(true);
        setContextPosition({ x, y });
    }

    function toggleContextMenu(event: React.MouseEvent) {
        event.preventDefault();
        const relativeX = event.clientX - event.currentTarget.getBoundingClientRect().left;
        const relativeY = event.clientY - event.currentTarget.getBoundingClientRect().top;
        setContextPosition({ x: relativeX, y: relativeY });
        setContextOpen(!contextOpen);
    }

    return (
        <>
            <BreadCrumb currentPath={path} onPathChange={onPathChange} />
            <div className={styles.fileList} onClick={() => setContextOpen(false)} onContextMenu={toggleContextMenu}>
                {list.map((folder) => (
                    <FileListEntry file={folder} path={path} onSelect={onSelect} onOpen={fileEntryOnOpen} onContextMenu={onContextMenu} selectedFiles={selectedFiles} key={folder.name} />
                ))}
                {contextOpen && (
                    <ContextMenu selectedFiles={selectedFiles} currentPath={path} actions={contextActions} position={contextPosition} />
                )}
            </div>

        </>

    );
}

function getEntriesOfPath(files: DirectoryListing, path: string): DirectoryListing {
    if (path === "") {
        return files;
    }
    const pathParts = path.split("/");
    let currentFiles = files;
    for (const part of pathParts) {
        const folder = currentFiles.find((file) => file.type === "folder" && file.name === part) as Folder | undefined;
        if (!folder) {
            return [];
        }
        currentFiles = folder.files;
    }
    return currentFiles;
}