import { Folder, File } from "@shared/files"
import FileIcon from "../FileIcon/FileIcon";
import { useState } from "react";
import styles from "./FileList.module.css";

type FileListEntryProps = {
    file: File | Folder,
    path: string,
    selectedFiles: string[],
    onSelect: (filePath: string) => void,
    onOpen(path: string): void,
    onContextMenu(x: number, y: number): void,
}

export default function FileListEntry({ file, path, selectedFiles, onSelect, onOpen, onContextMenu }: FileListEntryProps) {
    const fileName = file.name;
    const filePath = path === "" ? fileName : `${path}/${fileName}`;
    const isSelected = selectedFiles.includes(filePath);


    function handleClick() {
        onSelect(filePath);
    }

    function contextMenu(event: React.MouseEvent) {
        event.preventDefault();
        if (!isSelected) {
            onSelect(filePath);
        }
        const relativeX = event.clientX - event.currentTarget.getBoundingClientRect().left;
        const relativeY = event.clientY - event.currentTarget.getBoundingClientRect().top;
        onContextMenu(relativeX, relativeY);
    }
    return (
        <div className={`${styles.fileEntry} ${isSelected && styles.selected}`} onClick={handleClick} onContextMenu={contextMenu} onDoubleClick={() => onOpen(filePath)}>
            <input type="checkbox" className={styles.checkBox} onChange={handleClick} checked={isSelected} />
            <FileIcon file={file} className={styles.fileIcon} />
            <span className={styles.fileName}>{fileName}</span>
        </div>
    )
}