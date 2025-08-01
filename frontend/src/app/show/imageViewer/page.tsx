"use client";

import { schema, getUiSchema, isCustomViewerOptions, CustomViewerOptions } from "./components/ImageViewerEdit/custom";
import { useEffect, useState } from "react";
import { createFileList } from "@shared/files/helpers";
import SingleEdit from "../components/SingleEdit";
import ImageViewer from "./components/ImageViewer";
import { useHost } from "@frontend/app/hooks/useHost";

function EvaluationComponent({ options }: { options: CustomViewerOptions }) {
    const [files, setFiles] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const host = useHost();

    useEffect(() => {
        const baseURL = new URL(`${host}/api/images/`);
        if (options.path) {
            createFileList(options.path, baseURL).then((fileList) => {
                setFiles(fileList);
            });
        }
    }, [options.path, host]);

    useEffect(() => {
        if (files.length > 0) {
            setIndex(0);
        }
        const interval = setInterval(() => {
            if (files.length > 0) {
                setIndex((prevIndex) => (prevIndex + 1) % files.length);
            }
        }, options.duration * 1000);
        return () => clearInterval(interval);
    }, [files]);

    if (host === "") {
        return <></>;
    }

    return (
        <ImageViewer options={{ path: files[index] }} onReady={() => { }} />
    );

}


export default function Page() {
    return (
        <SingleEdit
            initialData={{
                "path": "",
                "duration": 30,
            }}
            name="Image Viewer"
            schema={schema}
            uiSchemaFn={getUiSchema}
            typeCheck={isCustomViewerOptions}
            renderComponent={(options: CustomViewerOptions) => { return <EvaluationComponent options={options} /> }}
        />
    );
}