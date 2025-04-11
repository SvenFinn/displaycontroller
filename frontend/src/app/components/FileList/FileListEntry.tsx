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
}

export default function FileListEntry({ file, path, selectedFiles, onSelect, onOpen }: FileListEntryProps) {
    const fileName = file.name;
    const filePath = path === "" ? fileName : `${path}/${fileName}`;
    const isSelected = selectedFiles.includes(filePath);
    const [selected, setSelected] = useState(isSelected);


    function handleClick() {
        setSelected(!selected);
    }

    return (
        <div className={`${styles.fileEntry} ${selected && styles.selected}`} onClick={handleClick} onDoubleClick={() => onOpen(filePath)}>
            <input type="checkbox" className={styles.checkBox} onChange={handleClick} checked={selected} />
            <FileIcon file={file} className={styles.fileIcon} />
            <span className={styles.fileName}>{fileName}</span>
        </div>
    )
}