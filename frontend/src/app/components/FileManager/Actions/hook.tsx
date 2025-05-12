import { useState } from "react";
import { ActionsCallbacks, DeleteDownloadCallback, CallbackWithoutProgress } from "./CallbackWrapper";

type InternalActionCb = () => void;

export type InternalActions = {
    cutAction?: InternalActionCb;
    copyAction?: InternalActionCb;
    pasteAction?: InternalActionCb;
    deleteAction?: InternalActionCb;
    downloadAction?: InternalActionCb;
    createFolderAction?: InternalActionCb;
    renameAction?: InternalActionCb;
    uploadAction?: InternalActionCb;
    closeDialog: InternalActionCb;
    clipboard: string[];
    action: ActionKey | undefined;
}

export type ActionKey = keyof InternalActions;

export function useActions(actions: ActionsCallbacks, currentPath: string, selectedFiles: string[], setSelectedFiles: (files: string[]) => void): InternalActions {
    const [action, setAction] = useState<ActionKey | undefined>(undefined);
    const [clipboard, setClipboard] = useState<string[]>([]);
    const [clipboardAction, setClipboardAction] = useState<"copy" | "cut" | undefined>(undefined);

    const cutAction = actions.moveAction ? () => {
        setClipboard(selectedFiles);
        setClipboardAction("cut");
        setAction(undefined);
        setSelectedFiles([]);
    } : undefined;
    const copyAction = actions.copyAction ? () => {
        setClipboard(selectedFiles);
        setClipboardAction("copy");
        setAction(undefined);
        setSelectedFiles([]);
    } : undefined;
    const pasteAction = actions.moveAction || actions.copyAction ? () => {
        if (clipboardAction === "cut") {
            setAction("cutAction");
        } else if (clipboardAction === "copy") {
            setAction("copyAction");
        }
    } : undefined;
    const deleteAction = actions.deleteAction ? () => {
        setAction("deleteAction");
    } : undefined;
    const createFolderAction = actions.createFolderAction ? () => {
        setAction("createFolderAction");
    } : undefined;
    const renameAction = actions.renameAction ? () => {
        setAction("renameAction");
    } : undefined;
    const uploadAction = actions.uploadAction ? () => {
        setAction("uploadAction");
    } : undefined;
    const downloadAction = actions.downloadAction ? () => {
        setAction("downloadAction");
    } : undefined;
    const closeDialog = () => {
        setAction(undefined);
        setClipboard([]);
        setClipboardAction(undefined);
        setSelectedFiles([]);
    };
    const internalActions: InternalActions = {
        cutAction,
        copyAction,
        pasteAction,
        deleteAction,
        downloadAction,
        createFolderAction,
        renameAction,
        uploadAction,
        closeDialog,
        clipboard,
        action,
    };
    return internalActions;
}