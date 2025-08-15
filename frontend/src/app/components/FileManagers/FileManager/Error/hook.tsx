import { useState } from "react";

export type ErrorHook = {
    message: string | null;
    setError(message: string): void;
    clearError(): void;
}

export function useError(): ErrorHook {
    const [message, setMessage] = useState<string | null>(null);

    const setError = (errorMessage: string) => {
        setMessage(errorMessage);
    };
    const clearError = () => {
        setMessage(null);
    }
    return {
        message,
        setError,
        clearError
    };
}