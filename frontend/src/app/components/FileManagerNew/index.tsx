
import { DirectoryListing } from "@shared/files";
import { useState } from "react";
import ColumnResize from "../ColumnResize";
import FolderTree from "./FolderTree";
import FileList from "./FileList";
import styles from "./FileManager.module.css";
import ToolBar from "./ToolBar";
import Loader from "./Loader";
import { ActionsProvider, BaseCallback, MoveCopyCallback, PercentageFunction, PercentageMessageFunction } from "./Actions/context";

type FileManagerProps = {
    initialPath: string;
    files: DirectoryListing;
    onSelect: (path: string) => void;
    onOpen?: (path: string) => void;
    onRefresh?: BaseCallback;
    onMove?: MoveCopyCallback;
    onCopy?: MoveCopyCallback;
    onDelete?: MoveCopyCallback;
    onCreateFolder?: MoveCopyCallback;
    onRename?: MoveCopyCallback;
    onUpload?: MoveCopyCallback;
}

export default function FileManager({ files, initialPath, onSelect, onOpen, onRefresh }: FileManagerProps) {
    const [selectedPath, setSelectedPath] = useState<string>(initialPath);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPercentage, setLoadingPercentage] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState("");

    async function onWrapper(cb: (setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>) {
        setLoading(true);
        setLoadingMessage("");
        setLoadingPercentage(0);
        try {
            await cb(setLoadingPercentage, setLoadingMessage);
        }
        catch (error) {
            // @ts-expect-error 
            setError(error.toString());
        }
        setLoading(false);
        setLoadingPercentage(0);
        setLoadingMessage("");
    }

    function onSelectInternal(path: string) {
        console.log("Selected path:", path);
        if (selectedFiles.includes(path)) {
            setSelectedFiles(selectedFiles.filter(file => file !== path));
        }
        else {
            setSelectedFiles([...selectedFiles, path]);
        }
        onSelect(path);
    }

    function onPathChange(path: string) {
        setSelectedFiles([]);
        setSelectedPath(path);
    }

    onOpen = onOpen || (() => { });

    const refresh = onRefresh && onWrapper.bind(null, onRefresh);

    return (
        <ActionsProvider>
            {loading && <Loader percentage={loadingPercentage} message={loadingMessage} />}
            <ToolBar refresh={refresh}>
            </ToolBar>
            <ColumnResize initialSizes={[20, 80]} className={styles.columns}>
                <FolderTree files={files} currentPath={selectedPath} onSelect={onPathChange} />
                <FileList files={files} currentPath={selectedPath} selectedFiles={selectedFiles} onPathChange={onPathChange} onSelect={onSelectInternal} onOpen={onOpen} />
            </ColumnResize>
        </ActionsProvider>
    )
}
