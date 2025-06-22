"use client";

import { schema, getUiSchema, isCustomEvaluationOptions, CustomEvaluationOptions } from "./components/EvaluationEdit/custom";
import { useEffect, useState } from "react";
import { createFileList } from "@shared/files/helpers";
import SingleEdit from "../components/SingleEdit";
import Evaluation from "./components/Evaluation";

function EvaluationComponent({ options }: { options: CustomEvaluationOptions }) {
    const [files, setFiles] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const host = window.location.host.split(":")[0];
        const baseURL = new URL(`http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/evaluations/`);
        if (options.path) {
            createFileList(options.path, baseURL).then((fileList) => {
                setFiles(fileList);
            });
        }
    }, [options.path]);

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

    return (
        <Evaluation options={{ path: files[index] }} onReady={() => { }} />
    );

}


export default function Page() {
    return (
        <SingleEdit
            initialData={{
                "path": "",
                "duration": 30,
            }}
            name="Evaluation"
            schema={schema}
            uiSchemaFn={getUiSchema}
            typeCheck={isCustomEvaluationOptions}
            renderComponent={(options: CustomEvaluationOptions) => { return <EvaluationComponent options={options} /> }}
        />
    );
}