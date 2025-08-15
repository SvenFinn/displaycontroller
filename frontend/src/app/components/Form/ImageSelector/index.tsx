"use client";

import { WidgetProps } from "@rjsf/utils";
import ImageManager from "../../FileManagers/images";


export default function ImageSelector(props: WidgetProps) {
    return (
        <div style={{ minHeight: "20vh" }}>
            <ImageManager allowMultiSelect={false} selectedFiles={[props.value]} onSelect={(file) => {
                if (props.value === file) {
                    props.onChange("");
                } else {
                    props.onChange(file);
                }
            }} />
            <p>Ausgewählte Datei / Ordner: {props.value}</p>
        </div>
    );
}
