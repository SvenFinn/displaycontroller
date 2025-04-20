import { useEffect } from "react";
import { ActionsCallbacks } from "../CallbackWrapper";

type DownloadProps = {
    selectedFiles: string[];
    closeDialog: () => void;
    actionCallbacks: ActionsCallbacks;
};

export default function Download({ selectedFiles, closeDialog, actionCallbacks }: DownloadProps) {
    useEffect(() => {
        closeDialog();
        if (actionCallbacks.downloadAction) {
            actionCallbacks.downloadAction(selectedFiles);
        }
    }, []);
    return <></>;
}