import { DirectoryListing } from "@shared/files";
import { ActionsCallbacks } from "../CallbackWrapper";
import ConflictResolution from "./ConflictResolution";

type CutProps = {
    clipboard: string[];
    currentPath: string;
    files: DirectoryListing;
    closeDialog: () => void;
    actionCallbacks: ActionsCallbacks;
}

export default function Cut({ clipboard, currentPath, files, closeDialog, actionCallbacks }: CutProps) {
    const conflictCallback = async (clipboard: string[]) => {
        closeDialog();
        if (clipboard.length === 0) {
            return;
        }
        if (actionCallbacks.moveAction) {
            await actionCallbacks.moveAction(clipboard, currentPath);
        }
        if (actionCallbacks.refreshAction) {
            actionCallbacks.refreshAction();
        }
    }
    return (
        <ConflictResolution clipboard={clipboard} currentPath={currentPath} files={files} onResolved={conflictCallback} />
    )
}