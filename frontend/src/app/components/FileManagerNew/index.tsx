
import { DirectoryListing } from "@shared/files";
import { useState } from "react";
import ColumnResize from "../ColumnResize";
import FolderTree from "../FolderTree";
import FileList from "../FileList";


type FileManagerProps = {
    initialPath: string;
    files: DirectoryListing;
    onSelect: (path: string) => void;
    onOpen?: (path: string) => void;
}

export default function FileManager({ files, initialPath, onSelect, onOpen }: FileManagerProps) {
    const [selectedPath, setSelectedPath] = useState<string>(initialPath);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    function onSelectInternal(path: string) {
        if (selectedFiles.includes(path)) {
            setSelectedFiles(selectedFiles.filter(file => file !== path));
        }
        else {
            setSelectedFiles([...selectedFiles, path]);
        }
        onSelect(path);
    }

    onOpen = onOpen || (() => { });

    return (
        <ColumnResize initialSizes={[20, 80]} style={{ backgroundColor: "white" }}>
            <FolderTree files={files} currentPath={selectedPath} onSelect={onSelectInternal} />
            <FileList files={files} currentPath={selectedPath} selectedFiles={selectedFiles} onPathChange={(path: string) => { setSelectedPath(path) }} onSelect={onSelectInternal} onOpen={onOpen} />
        </ColumnResize>
    )
}