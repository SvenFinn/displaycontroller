import { ActionsCallbacks } from "../CallbackWrapper";
import Dialog from "../../../../Dialog";

type DeleteProps = {
    actionCallbacks: ActionsCallbacks;
    selectedFiles: string[];
    closeDialog: () => void;
};

export default function Delete({ actionCallbacks, selectedFiles, closeDialog }: DeleteProps) {
    const deleteFiles = async () => {
        closeDialog();
        if (actionCallbacks.deleteAction) {
            await actionCallbacks.deleteAction(selectedFiles);
        }
        if (actionCallbacks.refreshAction) {
            actionCallbacks.refreshAction();
        }
    }
    return (
        <Dialog title="Delete files" onCancel={closeDialog} onConfirm={deleteFiles} confirmText="Delete" confirmColor="red">
            <p>Are you sure you want to delete the following files: </p>
            <ul>
                {selectedFiles.map((file, index) => (
                    <li key={index}>{file}</li>
                ))}
            </ul>
            <p>This action cannot be undone.</p>
        </Dialog>
    )
}