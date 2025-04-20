import { useEffect, useRef, useState } from "react";
import { ActionsCallbacks } from "../CallbackWrapper";
import Dialog from "@frontend/app/components/Dialog";

type RenameProps = {
    selectedFiles: string[];
    closeDialog: () => void;
    actionCallbacks: ActionsCallbacks;
};


export default function Rename({ selectedFiles, closeDialog, actionCallbacks }: RenameProps) {
    const [index, setIndex] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dialog if index is larger than selectedFiles
    useEffect(() => {
        if (index >= selectedFiles.length) {
            closeDialog();
            if (actionCallbacks.refreshAction) {
                actionCallbacks.refreshAction();
            }
        }
    }, [index, selectedFiles.length, closeDialog]);
    const file = selectedFiles[index];
    const renameFile = async () => {
        if (!actionCallbacks.renameAction) {
            return;
        }
        if (inputRef.current) {
            const newName = inputRef.current.value;
            if (newName) {
                const newPath = file.split("/").slice(0, -1).join("/") + "/" + newName;

                await actionCallbacks.renameAction(file, newPath);
                setIndex(index + 1);
            }
        }
    }
    if (!file) {
        return null;
    }
    return (
        <Dialog title="Rename file" onCancel={closeDialog} onConfirm={renameFile} confirmText="Rename" >
            <p>Enter the new name for the file:</p>
            <input type="text" ref={inputRef} defaultValue={file.split("/").pop()} />
        </Dialog>
    )
}