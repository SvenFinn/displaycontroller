import { LoaderHook } from "../Loader/hook";

export type PercentageFunction = (percentage: number) => void;
export type PercentageMessageFunction = (message: string) => void;
export type BaseCallback = (setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;
export type MoveCopyCallback = (sources: string[], destination: string, setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;
export type DeleteDownloadCallback = (files: string[], setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;
export type FolderCreateCallback = (path: string, setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;
export type RenameCallback = (oldPath: string, newPath: string, setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;
export type UploadCallback = (files: FileList, destination: string, setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;

export type Callbacks = {
    moveAction?: MoveCopyCallback;
    copyAction?: MoveCopyCallback;
    deleteAction?: DeleteDownloadCallback;
    downloadAction?: DeleteDownloadCallback;
    createFolderAction?: FolderCreateCallback;
    renameAction?: RenameCallback;
    uploadAction?: UploadCallback;
    refreshAction?: BaseCallback;
}

type DropLast<T extends any[]> = T extends [...infer Rest, any] ? Rest : never;
type DropLastTwo<T extends any[]> = DropLast<DropLast<T>>;

export type CallbackWithoutProgress<T extends (...args: any[]) => Promise<void>> =
    (...args: DropLastTwo<Parameters<T>>) => ReturnType<T>;

export type ActionsCallbacks = {
    moveAction?: CallbackWithoutProgress<MoveCopyCallback>;
    copyAction?: CallbackWithoutProgress<MoveCopyCallback>;
    deleteAction?: CallbackWithoutProgress<DeleteDownloadCallback>;
    downloadAction?: CallbackWithoutProgress<DeleteDownloadCallback>;
    createFolderAction?: CallbackWithoutProgress<FolderCreateCallback>;
    renameAction?: CallbackWithoutProgress<RenameCallback>;
    uploadAction?: CallbackWithoutProgress<UploadCallback>;
    refreshAction?: CallbackWithoutProgress<BaseCallback>;
}


export function useCallbackLoader<
    P extends any[]
>(
    callback: ((...args: [...P, PercentageFunction, PercentageMessageFunction]) => Promise<void>) | undefined,
    loader: LoaderHook
): ((...args: P) => Promise<void>) | undefined {
    if (!callback) {
        return undefined;
    }
    return async (...args: P) => {
        const { setPercentage, setMessage, startLoading, stopLoading } = loader;
        startLoading();
        try {
            await callback(...args, setPercentage, setMessage);
        } catch (error) {
            console.error(error instanceof Error ? error.message : String(error));
        } finally {
            stopLoading();
        }
    };
}
