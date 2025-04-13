import { DirectoryListing, Folder } from "@shared/files";
import styles from "./FileList.module.css";
import FileListEntry from "./FileListEntry";
import BreadCrumb from "./BreadCrumb";


type FileListProps = {
    files: DirectoryListing;
    currentPath: string;
    selectedFiles: string[];
    onPathChange(path: string): void;
    onSelect(path: string): void;
    onOpen(path: string): void;
}


export default function FileList({ files, currentPath, selectedFiles, onPathChange, onSelect, onOpen }: FileListProps) {
    const path = currentPath.split("/").filter((part) => part !== "").join("/");
    const entries = getEntriesOfPath(files, path);
    const folderList = entries.filter((entry) => entry.type === "folder") as Folder[];
    const fileList = entries.filter((entry) => entry.type === "file");
    const list = [...folderList, ...fileList];

    function fileEntryOnOpen(path: string) {
        const file = list.find((file) => file.name === path);
        if (file && file.type === "folder") {
            onPathChange(path);
        } else {
            onOpen(path);
        }
    }

    return (
        <>
            <BreadCrumb currentPath={path} onPathChange={onPathChange} />
            <div className={styles.fileList}>
                {list.map((folder) => (
                    <FileListEntry file={folder} path={path} onSelect={onSelect} onOpen={fileEntryOnOpen} selectedFiles={selectedFiles} key={folder.name} />
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