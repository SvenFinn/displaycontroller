import { useRef } from "react";
import { ActionsCallbacks } from "../CallbackWrapper";
import Dialog from "@frontend/app/components/Dialog";

type UploadProps = {
    currentPath: string;
    closeDialog: () => void;
    actionCallbacks: ActionsCallbacks;
}

export default function Upload({ currentPath, closeDialog, actionCallbacks }: UploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const uploadFiles = async () => {
        if (!actionCallbacks.uploadAction) {
            return;
        }
        if (inputRef.current) {
            const files = inputRef.current.files;
            if (files) {
                closeDialog();
                await actionCallbacks.uploadAction(files, currentPath);
                if (actionCallbacks.refreshAction) {
                    actionCallbacks.refreshAction();
                }
            }
        }
    }
    return (
        <Dialog title="Upload files" onCancel={closeDialog} onConfirm={uploadFiles} confirmText="Upload" >
            <p>Select the files to upload:</p>
            <input type="file" ref={inputRef} multiple />
        </Dialog>
    )
}