import { DirectoryListing } from "@shared/files";
import { ActionsCallbacks } from "../CallbackWrapper";
import ConflictResolution from "./ConflictResolution";

type CopyProps = {
    clipboard: string[];
    currentPath: string;
    files: DirectoryListing;
    closeDialog: () => void;
    actionCallbacks: ActionsCallbacks;
}

export default function Copy({ clipboard, currentPath, files, closeDialog, actionCallbacks }: CopyProps) {
    const conflictCallback = async (clipboard: string[]) => {
        closeDialog();
        if (clipboard.length === 0) {
            return;
        }
        if (actionCallbacks.copyAction) {
            await actionCallbacks.copyAction(clipboard, currentPath);
        }
        if (actionCallbacks.refreshAction) {
            actionCallbacks.refreshAction();
        }

    }
    return (
        <ConflictResolution clipboard={clipboard} currentPath={currentPath} files={files} onResolved={conflictCallback} />
    )
}