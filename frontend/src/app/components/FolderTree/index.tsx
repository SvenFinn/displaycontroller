"use client";

import { useState } from "react";
import styles from "./FolderTree.module.css";
import { FaChevronDown, FaChevronRight, FaRegFolder, FaRegFolderOpen } from "react-icons/fa6";
import { DirectoryListing, Folder } from "@shared/files";

type FolderTreeProps = {
    files: DirectoryListing;
    currentPath: string;
    onSelect(path: string): void;
}

type InternalFolderTreeProps = FolderTreeProps & {
    path: string;
}


export default function FolderTree({ files, currentPath, onSelect }: FolderTreeProps) {
    const folders = getFoldersInPath(files, "");
    return (
        <div className={styles.folderTree}>
            {folders.map(folder => (
                <FolderTreeInternal
                    key={folder}
                    files={files}
                    currentPath={currentPath}
                    path={folder}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}

function FolderTreeInternal({ files, path, currentPath, onSelect }: InternalFolderTreeProps) {
    const [expanded, setExpanded] = useState<boolean>(path === "" || (currentPath.startsWith(path) && path !== currentPath));

    const folders = getFoldersInPath(files, path);

    function handleExpand(event: React.MouseEvent) {
        event.stopPropagation();
        setExpanded(!expanded);
    }

    const folderName = path.split("/").pop() || "Home";

    return (
        <div className={styles.folder}>
            <div className={`${styles.folderName} ${path === currentPath ? styles.selected : ""}`} onClick={() => onSelect(path)}>
                {path !== "" && folders.length > 0 ?
                    <span className={styles.expandSpan} onClick={handleExpand}>{expanded ? <FaChevronDown /> : <FaChevronRight />}</span> :
                    <span className={styles.expandSpan}></span>
                }
                {expanded ? <FaRegFolderOpen className={styles.faIcon} /> : <FaRegFolder className={styles.faIcon} />}
                {folderName}
            </div>
            {expanded && folders.map(folder => (
                <FolderTreeInternal
                    key={folder}
                    files={files}
                    currentPath={currentPath}
                    path={`${path}/${folder}`}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

function getFoldersInPath(files: DirectoryListing, path: string): Array<string> {
    const pathArr = path.split("/");
    let currentFiles = files;
    for (const folder of pathArr) {
        if (folder === "") continue;
        const foundFolder = currentFiles.find(file => file.name === folder && file.type === "folder") as Folder | undefined;
        if (!foundFolder) return [];
        currentFiles = foundFolder.files;
    }
    const folders = new Set<string>();
    for (const file of currentFiles) {
        if (file.type === "folder") {
            folders.add(file.name);
        }
    }
    return Array.from(folders);
}