
import { DirectoryListing } from "@shared/files";
import { use, useState } from "react";
import ColumnResize from "../ColumnResize";
import FolderTree from "./FolderTree";
import FileList from "./FileList";
import styles from "./FileManager.module.css";
import ToolBar from "./ToolBar";
import Loader from "./Loader";
import ActionButtons from "./Actions/Buttons";
import useLoader from "./Loader/hook";
import { BaseCallback, DeleteDownloadCallback, FolderCreateCallback, MoveCopyCallback, RenameCallback, UploadCallback, useCallbackLoader } from "./Actions/CallbackWrapper";
import { useActions } from "./Actions/hook";
import ActionsRunner from "./Actions/Runner";

type FileManagerProps = {
    initialPath: string;
    allowMultiSelect?: boolean;
    files: DirectoryListing;
    onSelect: (path: string) => void;
    onOpen?: (path: string) => void;
    onRefresh: BaseCallback;
    onMove?: MoveCopyCallback;
    onCopy?: MoveCopyCallback;
    onDelete?: DeleteDownloadCallback;
    onDownload?: DeleteDownloadCallback;
    onCreateFolder?: FolderCreateCallback;
    onRename?: RenameCallback;
    onUpload?: UploadCallback;
}

export default function FileManager({ files, allowMultiSelect, initialPath, onSelect, onOpen, onRefresh, onCopy, onCreateFolder, onDelete, onMove, onRename, onUpload, onDownload }: FileManagerProps) {
    const [currentPath, setCurrentPath] = useState<string>(initialPath);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    allowMultiSelect = allowMultiSelect == undefined ? true : allowMultiSelect;

    const loader = useLoader();


    function onSelectInternal(path: string) {
        if (selectedFiles.includes(path)) {
            setSelectedFiles(selectedFiles.filter(file => file !== path));
        }
        else {
            if (!allowMultiSelect) {
                setSelectedFiles([path]);
            }
            else {
                setSelectedFiles([...selectedFiles, path]);
            }
        }
        onSelect(path);
    }

    function onPathChange(path: string) {
        setSelectedFiles([]);
        setCurrentPath(path);
    }

    onOpen = onOpen || (() => { });
    const actions = {
        moveAction: useCallbackLoader(onMove, loader),
        copyAction: useCallbackLoader(onCopy, loader),
        deleteAction: useCallbackLoader(onDelete, loader),
        downloadAction: useCallbackLoader(onDownload, loader),
        createFolderAction: useCallbackLoader(onCreateFolder, loader),
        renameAction: useCallbackLoader(onRename, loader),
        uploadAction: useCallbackLoader(onUpload, loader),
        refreshAction: useCallbackLoader(onRefresh, loader),
    };
    const internalActions = useActions(actions, currentPath, selectedFiles, setSelectedFiles);
    return (
        <>
            <Loader loader={loader} />
            <ActionsRunner action={internalActions.action} actionCallbacks={actions} selectedFiles={selectedFiles} currentPath={currentPath} clipboard={internalActions.clipboard} closeDialog={internalActions.closeDialog} files={files} />
            <ToolBar refresh={actions.refreshAction}>
                <ActionButtons selectedFiles={selectedFiles} actions={internalActions} currentPath={currentPath} />
            </ToolBar>
            <ColumnResize initialSizes={[20, 80]} className={styles.columns}>
                <FolderTree files={files} currentPath={currentPath} onSelect={onPathChange} />
                <FileList files={files} currentPath={currentPath} selectedFiles={selectedFiles} onPathChange={onPathChange} onSelect={onSelectInternal} onOpen={onOpen} contextActions={internalActions} />
            </ColumnResize>
        </>)
}
