"use client";

import { RegistryWidgetsType, RJSFSchema, UiSchema } from "@rjsf/utils";
import root from "react-shadow";
import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";
import bootstrapCss from '!!raw-loader!bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useRef, useState } from "react";
import SingleRangeSelector from "./RangeSelector/single";
import EvaluationSelector from "./EvaluationSelector";
import ImageSelector from "./ImageSelector";
import RangesGrid from "./RangesGrid";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import dynamic from "next/dynamic";

export interface FormDefinition<T> {
    schema: RJSFSchema;
    uiSchemaFn?: (data: T) => UiSchema;
    widgets?: RegistryWidgetsType;
    onSubmit: (data: T) => void;
    onChange?: (data: T) => void;
    typeCheck: (data: any) => data is T;
    initialData: T;
    className?: string;
}

export default function FormWrapper<T>({ schema, uiSchemaFn, widgets, onChange, onSubmit, typeCheck, initialData, className }: FormDefinition<T>) {
    const [parentStyles, setParentStyles] = useState<string>("");
    const [formData, setFormData] = useState<T>(initialData);
    const allWidgets: RegistryWidgetsType = {
        "RangesGrid": RangesGrid,
        "SingleRangeSelector": SingleRangeSelector,
        "EvaluationSelector": EvaluationSelector,
        "ImageSelector": ImageSelector,
        ...widgets
    };

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    useEffect(() => {
        function updateStyleSheets() {
            const styles = Array.from(document.styleSheets).flatMap((sheet) => {
                return Array.from(sheet.cssRules || [])
            }).reduce((acc: string, rule) => {
                return acc + rule.cssText + "\n";
            }, "");
            if (styles !== parentStyles) {
                setParentStyles(styles);
            }
        }
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    updateStyleSheets();
                    break;
                }
            }
        });

        // Watch the <head> for new <link> or <style> elements
        observer.observe(document.head, {
            childList: true,
            subtree: true,
        });
        updateStyleSheets();
    }, []);

    function handleChange(data: any): void {
        const { formData } = data;
        if (!typeCheck(formData)) {
            return;
        }
        setFormData(formData);

        if (!onChange) {
            return;
        }
        onChange(formData)
    }

    function handleSubmit(data: any): void {
        const { formData } = data;
        if (!typeCheck(formData)) {
            alert("Validation for Form output failed");
            return;
        }
        onSubmit(formData);
    }


    const ref = useRef<HTMLDivElement>(null);

    const cache = createCache({
        key: "css",
        prepend: true,
        container: ref.current || undefined,
    });

    return (
        <root.div className={className || ""}>
            <CacheProvider value={cache}>
                <style>{parentStyles}</style>
                <style>{bootstrapCss}</style>
                <div data-bs-theme="light" ref={ref} >
                    <Form schema={schema} uiSchema={uiSchemaFn ? uiSchemaFn(formData) : undefined} formData={formData} validator={validator} widgets={allWidgets} onChange={handleChange} onSubmit={handleSubmit} />
                </div>
            </CacheProvider>
        </root.div>
    )
}