"use client";

import { DrawTargetOptions, isDrawTargetOptions } from "@shared/screens/drawTarget";
import DrawTargetEdit from "./components/DrawTargetEdit";
import { useSearchParams } from "next/navigation";
import DrawTarget from "./components/DrawTarget/drawTarget";
import { Suspense } from "react";

function SuspenseWrapper() {
    function handleSubmit(options: DrawTargetOptions) {
        // Serialize the options to JSON
        const jsonOptions = JSON.stringify(options);

        // Append the JSON to the URL as a query parameter
        const url = new URL(window.location.href);
        url.searchParams.set("options", jsonOptions);
        window.location.href = url.toString();
    }

    const searchParams = useSearchParams();
    const optionsParam = searchParams.get("options");
    const options = optionsParam ? JSON.parse(optionsParam) : null;
    const validatedOptions = options && isDrawTargetOptions(options) ? options : null;


    return (
        <>
            {!validatedOptions ? (
                <>
                    <h1>Custom View: DrawTarget</h1>
                    <p>Create a custom DrawTarget view</p>
                    <DrawTargetEdit onSubmit={handleSubmit} />
                </>
            ) : (
                <DrawTarget options={validatedOptions} />
            )}
        </>
    );
}


export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuspenseWrapper />
        </Suspense>
    );
}