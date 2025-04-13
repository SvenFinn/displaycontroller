import { createContext, useContext, useState } from "react";

export type PercentageFunction = (percentage: number) => void;
export type PercentageMessageFunction = (message: string) => void;
export type BaseCallback = (setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;
export type MoveCopyCallback = (sources: string[], destination: string, setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;
export type DeleteCallback = (files: string[], setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;
export type FolderCreateCallback = (path: string, setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;
export type RenameCallback = (oldPath: string, newPath: string, setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;
export type UploadCallback = (files: File[], destination: string, setPercentage: PercentageFunction, setMessage: PercentageMessageFunction) => Promise<void>;

export type ActionsContextType = {
    clipboard: string[];
    setClipboard: (clipboard: string[]) => void;
    move: MoveCopyCallback | undefined;
    copy: MoveCopyCallback | undefined;
    deleteAction: DeleteCallback | undefined;
    createFolder: FolderCreateCallback | undefined;
    rename: RenameCallback | undefined;
    upload: UploadCallback | undefined;
}


export const ActionsContext = createContext<ActionsContextType | null>(null);
export const useActionsContext = () => {
    const context = useContext(ActionsContext);
    if (!context) {
        throw new Error("useActionsContext must be used within a ActionsProvider");
    }
    return context;
}

export function ActionsProvider({
    children,
    move,
    copy,
    deleteAction,
    createFolder,
    rename,
    upload
}: {
    children: React.ReactNode;
    move?: MoveCopyCallback;
    copy?: MoveCopyCallback;
    deleteAction?: DeleteCallback;
    createFolder?: FolderCreateCallback;
    rename?: RenameCallback;
    upload?: UploadCallback;
}) {
    const [clipboard, setClipboard] = useState<string[]>([]);

    const value = {
        clipboard,
        setClipboard,
        move,
        copy,
        deleteAction,
        createFolder,
        rename,
        upload
    };

    return (
        <ActionsContext.Provider value={value}>
            {children}
        </ActionsContext.Provider>
    );
}

