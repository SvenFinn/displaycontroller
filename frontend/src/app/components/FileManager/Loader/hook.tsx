import { useState } from "react";

export type LoaderHook = {
    isLoading: boolean;
    percentage: number;
    message: string;
    startLoading(): void;
    stopLoading(): void;
    setPercentage(percentage: number): void;
    setMessage(message: string): void;
}

export default function useLoader(): LoaderHook {
    const [percentage, setPercentage] = useState(0);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function startLoading() {
        setIsLoading(true);
        setPercentage(0);
        setMessage("");
    }

    function stopLoading() {
        setIsLoading(false);
        setPercentage(0);
        setMessage("");
    }

    return {
        isLoading,
        percentage,
        message,
        startLoading,
        stopLoading,
        setPercentage,
        setMessage
    }
}