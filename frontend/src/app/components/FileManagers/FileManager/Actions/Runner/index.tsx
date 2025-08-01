import { ActionsCallbacks } from "../CallbackWrapper";
import { ActionKey } from "../hook";
import { DirectoryListing } from "@shared/files";
import Download from "./Download";
import Delete from "./Delete";
import Cut from "./Cut";
import Copy from "./Copy";
import CreateFolder from "./CreateFolder";
import Rename from "./Rename";
import Upload from "./Upload";

export type ActionRunnerProps = {
    selectedFiles: string[];
    currentPath: string;
    closeDialog: () => void;
    action: ActionKey | undefined;
    clipboard: string[];
    actionCallbacks: ActionsCallbacks;
    files: DirectoryListing;
};

export default function ActionsRunner({ actionCallbacks, selectedFiles, action, closeDialog, clipboard, currentPath, files }: ActionRunnerProps) {
    switch (action) {
        case "downloadAction":
            return <Download selectedFiles={selectedFiles} closeDialog={closeDialog} actionCallbacks={actionCallbacks} />;
        case "deleteAction":
            return <Delete actionCallbacks={actionCallbacks} selectedFiles={selectedFiles} closeDialog={closeDialog} />;
        case "cutAction":
            return <Cut clipboard={clipboard} currentPath={currentPath} files={files} closeDialog={closeDialog} actionCallbacks={actionCallbacks} />;
        case "copyAction":
            return <Copy clipboard={clipboard} currentPath={currentPath} files={files} closeDialog={closeDialog} actionCallbacks={actionCallbacks} />;
        case "createFolderAction":
            return <CreateFolder actionCallbacks={actionCallbacks} currentPath={currentPath} closeDialog={closeDialog} />;
        case "renameAction":
            return <Rename actionCallbacks={actionCallbacks} selectedFiles={selectedFiles} closeDialog={closeDialog} />;
        case "uploadAction":
            return <Upload actionCallbacks={actionCallbacks} currentPath={currentPath} closeDialog={closeDialog} />;
        default:
            return <></>;
    }
}

