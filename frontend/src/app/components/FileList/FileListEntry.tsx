import { Folder, File } from "@shared/files"

type FileListEntryProps = {
    file: File | Folder,
    path: string,
    onClick(path: string): void,
}

export default function FileListEntry({ file, path, onClick }: FileListEntryProps) {
    const fileName = file.name;
    const filePath = path === "" ? fileName : `${path}/${fileName}`;
    const isFolder = file.type === "folder";

    function handleClick() {
        onClick(filePath);
    }

    return (
        <div className={isFolder ? "folder" : "file"} onClick={handleClick}>
            {fileName}
        </div>
    )
}