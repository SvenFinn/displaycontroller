import Dialog from "@frontend/app/components/Dialog";
import { DirectoryListing } from "@shared/files";
import { flattenFileList } from "@shared/files/helpers";
import { useEffect, useState } from "react";

export function getConflicts(files: DirectoryListing, clipboard: Array<string>, currentPath: string): Array<string> {
    const fileNames = clipboard.map(file => file.split("/").pop() || "").filter(value => value !== "");
    const targetPaths = fileNames.map(file => `${currentPath}/${file}`);
    const filePaths = flattenFileList(files, "");

    const conflicts = targetPaths.filter(path => filePaths.some(filePath => filePath.startsWith(path)));
    return conflicts;
}

// I need a component that will show each conflict and ask the user what to do with it
// The user can choose to skip or overwrite the file
// The component should take the conflicts as props and show one conflict at a time

type ConflictResolutionProps = {
    files: DirectoryListing;
    clipboard: Array<string>;
    currentPath: string;
    onResolved: (files: Array<string>) => void; // List of files to overwrite
}

export default function ConflictResolution({ files, clipboard, currentPath, onResolved }: ConflictResolutionProps) {
    const conflicts = getConflicts(files, clipboard, currentPath);
    const nonConflicts = clipboard.filter(file => !conflicts.includes(file));
    const [resolvedConflicts, setResolvedConflicts] = useState<Array<string>>(nonConflicts);
    const [index, setIndex] = useState<number>(0);

    function onSkip() {
        const nextIndex = index + 1;
        if (nextIndex >= conflicts.length) {
            onResolved(resolvedConflicts);
        }
        else {
            setIndex(nextIndex);
        }
    }
    function onOverwrite() {
        const file = conflicts[index];
        setResolvedConflicts([...resolvedConflicts, file]);
        onSkip();
    }
    useEffect(() => {
        if (conflicts.length === 0) {
            onResolved(resolvedConflicts);
        }
    }, [conflicts]);
    if (conflicts.length === 0) {
        return null;
    }
    return (
        <Dialog title="Conflict Resolution" onCancel={onSkip} cancelText="Skip" onConfirm={onOverwrite} confirmText="Overwrite">
            <p>
                The file <strong>{conflicts[index]}</strong> already exists in the target directory. Do you want to overwrite it?
            </p>
        </Dialog>
    );
}