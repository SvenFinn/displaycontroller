"use client";

import { WidgetProps } from "@rjsf/utils";
import EvaluationManager from "../../FileManagers/evaluation";


export default function EvaluationSelector(props: WidgetProps) {

    return (
        <>
            <EvaluationManager allowMultiSelect={false} selectedFiles={[props.value]} onSelect={(file) => {
                if (props.value === file) {
                    props.onChange("");
                } else {
                    props.onChange(file);
                }
            }} />
            <p>Ausgewählte Datei / Ordner: {props.value}</p>
        </>
    );
}
