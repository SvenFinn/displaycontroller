import { useRef } from "react";
import { ActionsCallbacks } from "../CallbackWrapper";
import Dialog from "@frontend/app/components/Dialog";

type CreateFolderProps = {
    currentPath: string;
    closeDialog: () => void;
    actionCallbacks: ActionsCallbacks;
}

export default function CreateFolder({ currentPath, closeDialog, actionCallbacks }: CreateFolderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const createFolder = async () => {
        if (!actionCallbacks.createFolderAction) {
            return;
        }
        if (inputRef.current) {
            const folderName = inputRef.current.value;
            if (folderName) {
                closeDialog();
                await actionCallbacks.createFolderAction(`${currentPath}/${folderName}`);
                if (actionCallbacks.refreshAction) {
                    actionCallbacks.refreshAction();
                }
            }
        }
    }
    return (
        <Dialog title="Create folder" onCancel={closeDialog} onConfirm={createFolder} confirmText="Create Folder">
            <p>Enter the name of the new folder:</p>
            <input type="text" ref={inputRef} />
        </Dialog>
    )
}
