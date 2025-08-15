import Dialog from "@frontend/app/components/Dialog";
import { ErrorHook } from "./hook";

export default function Error({ error }: { error: ErrorHook }) {
    const { message, clearError } = error;
    if (!message) {
        return <></>;
    }
    return (
        <Dialog title="Error" onConfirm={clearError} >
            {message}
        </Dialog>
    );
}    