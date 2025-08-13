"use client";

import { schema, getUiSchema, isCustomViewerOptions, CustomViewerOptions } from "./components/ImageViewerEdit/custom";
import SingleEdit from "../components/SingleEdit";
import LocalScreen from "../components/LocalScreen";

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
            renderComponent={(options: CustomViewerOptions) => {
                return <LocalScreen screen={{ type: "imageViewer", options: options, duration: options.duration }} />
            }}
        />
    );
}