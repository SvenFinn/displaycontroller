"use client";

import { schema, getUiSchema, isCustomEvaluationOptions, CustomEvaluationOptions } from "./components/EvaluationEdit/custom";
import SingleEdit from "../components/SingleEdit";
import LocalScreen from "../components/LocalScreen";

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
            renderComponent={(options: CustomEvaluationOptions) => {
                return <LocalScreen screen={{
                    type: "evaluation",
                    options: options,
                    duration: options.duration,
                }} />
            }}
        />
    );
}