import { File, Folder } from "@shared/files";
import { FaRegFileAudio, FaRegFileExcel, FaRegFileImage, FaRegFilePdf, FaRegFilePowerpoint, FaRegFileVideo, FaRegFileWord, FaRegFileZipper, FaRegFileCode, FaRegFile, FaRegFolderOpen } from "react-icons/fa6";
import mime from "mime";

export default function FileIcon({ file, className }: { file: File | Folder; className?: string }) {
    if (file.type === "folder") {
        return <FaRegFolderOpen className={className} />;
    }
    const mimeType = mime.getType(file.name);
    if (!mimeType) {
        return <FaRegFile className={className} />;
    }
    if (mimeType.startsWith("image/")) {
        return <FaRegFileImage className={className} />;
    } else if (mimeType.startsWith("video/")) {
        return <FaRegFileVideo className={className} />;
    } else if (mimeType.startsWith("audio/")) {
        return <FaRegFileAudio className={className} />;
    }
    switch (mimeType) {
        case "application/pdf":
            return <FaRegFilePdf className={className} />;
        case "application/zip":
        case "application/zip-compressed":
        case "application/x-zip-compressed":
        case "application/x-tar":
        case "application/x-rar-compressed":
        case "application/x-gzip":
        case "application/x-gtar":
        case "application/x-7z-compressed":
        case "application/gzip":
            return <FaRegFileZipper className={className} />;
        case "application/vnd.ms-excel":
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return <FaRegFileExcel className={className} />;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        case "application/msword":
            return <FaRegFileWord className={className} />;
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        case "application/vnd.ms-powerpoint":
            return <FaRegFilePowerpoint className={className} />;
        default:
            return <FaRegFileCode className={className} />;


    }
}