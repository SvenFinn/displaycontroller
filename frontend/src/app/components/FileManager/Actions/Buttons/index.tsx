import Button from "./button";
import { FaDownload, FaFolderPlus, FaRegCopy, FaRegPaste, FaTrash, FaUpload } from "react-icons/fa6";
import { FaCut } from "react-icons/fa";
import { BiRename } from "react-icons/bi";
import { InternalActions } from "../hook";

type ActionButtonsProps = {
    selectedFiles: string[];
    currentPath: string;
    actions: InternalActions;
}

export default function Actions({ selectedFiles, actions, currentPath }: ActionButtonsProps) {
    return (
        <>
            {selectedFiles.length > 0 && actions.downloadAction && (
                <Button onClick={() => {
                    if (actions.downloadAction) {
                        actions.downloadAction();
                    }
                }}>
                    <FaDownload />Download
                </Button>
            )}
            {selectedFiles.length > 0 && actions.copyAction && (
                <Button onClick={() => {
                    if (actions.copyAction) {
                        actions.copyAction();
                    }
                }}>
                    <FaRegCopy />Copy
                </Button>
            )}
            {selectedFiles.length > 0 && actions.cutAction && (
                <Button onClick={() => {
                    if (actions.cutAction) {
                        actions.cutAction();
                    }
                }}>
                    <FaCut />Cut
                </Button>
            )}
            {selectedFiles.length > 0 && actions.renameAction && (
                <Button onClick={() => {
                    if (actions.renameAction) {
                        actions.renameAction();
                    }
                }}>
                    <BiRename />Rename
                </Button>
            )}
            {selectedFiles.length > 0 && actions.deleteAction && (
                <Button onClick={() => {
                    if (actions.deleteAction) {
                        actions.deleteAction();
                    }
                }}>
                    <FaTrash />Delete
                </Button>
            )}
            {actions.clipboard.length > 0 && actions.pasteAction && (
                <Button onClick={() => {
                    if (actions.pasteAction) {
                        actions.pasteAction();
                    }
                }}>
                    <FaRegPaste />Paste
                </Button>
            )}
            {selectedFiles.length === 0 && actions.createFolderAction && (
                <Button onClick={() => {
                    if (actions.createFolderAction) {
                        actions.createFolderAction();
                    }
                }}>
                    <FaFolderPlus />New Folder
                </Button>
            )}
            {selectedFiles.length === 0 && actions.uploadAction && (
                <Button onClick={() => {
                    if (actions.uploadAction) {
                        actions.uploadAction();
                    }
                }}>
                    <FaUpload />Upload
                </Button>
            )}
        </>
    )
}