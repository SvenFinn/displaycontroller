"use client";

import React, { Suspense } from "react";
import FormWrapper from "@frontend/app/components/Form";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { useSearchParams } from "next/navigation";
import styles from "./SingleEdit.module.css";
import Show from "../Show";

export interface SingleEditProps<T> {
    initialData: T;
    name: string;
    schema: RJSFSchema;
    uiSchemaFn: (data: T) => UiSchema;
    typeCheck: (data: any) => data is T;
    renderComponent: (data: T) => React.ReactElement;
}

export default function SingleEdit<T>({ initialData, name, schema, uiSchemaFn, typeCheck, renderComponent }: SingleEditProps<T>) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SingleEditComponent<T>
                initialData={initialData}
                schema={schema}
                uiSchemaFn={uiSchemaFn}
                typeCheck={typeCheck}
                renderComponent={renderComponent}
                name={name} />
        </Suspense>
    )
}

function SingleEditComponent<T>({ initialData, schema, uiSchemaFn, typeCheck, renderComponent, name }: SingleEditProps<T>) {
    function handleSubmit(options: T) {
        // Serialize the options to JSON
        const jsonOptions = JSON.stringify(options);

        // Append the JSON to the URL as a query parameter
        const url = new URL(window.location.href);
        url.searchParams.set("options", jsonOptions);
        window.location.href = url.toString();
    }

    const searchParams = useSearchParams();
    const optionsParam = searchParams.get("options");
    const options = optionsParam ? parseJSON(optionsParam) : null;
    const validatedOptions = options && typeCheck(options) ? options : null;

    return (
        <>
            {!validatedOptions ? (
                <div className={styles.container}>
                    <h1>Custom View: {name}</h1>
                    <p>Create a custom {name} view</p>
                    <FormWrapper
                        schema={schema}
                        uiSchemaFn={uiSchemaFn}
                        initialData={initialData}
                        typeCheck={typeCheck}
                        onSubmit={handleSubmit} />
                </div>
            ) : (
                <Show>
                    {renderComponent(validatedOptions)}
                </Show>
            )
            }
        </>
    );
}

function parseJSON(jsonString: string | null): any {
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse JSON:", error);
        return null;
    }
}