import { DirectoryListing, Folder } from "@shared/files";
import styles from "./FileList.module.css";
import FileListEntry from "./FileListEntry";
import TopBar from "./TopBar";


type FileListProps = {
    files: DirectoryListing;
    currentPath: string;
    onPathChange(path: string): void;
    onSelect(path: string): void;
}


export default function FileList({ files, currentPath, onPathChange, onSelect }: FileListProps) {
    const path = currentPath.split("/").filter((part) => part !== "").join("/");
    const entries = getEntriesOfPath(files, path);
    const folderList = entries.filter((entry) => entry.type === "folder") as Folder[];
    const fileList = entries.filter((entry) => entry.type === "file");

    return (
        <>
            <TopBar currentPath={path} onPathChange={onPathChange} />
            <div className={styles.fileList}>
                {folderList.map((folder) => (
                    <FileListEntry file={folder} path={path} onClick={onPathChange} key={folder.name} />
                ))}
                {fileList.map((file) => (
                    <FileListEntry file={file} path={path} onClick={onSelect} key={file.name} />
                ))}
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