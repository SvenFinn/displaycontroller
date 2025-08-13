"use client";

import { DrawTargetOptions, isDrawTargetOptions } from "dc-screens-types";
import SingleEdit from "../components/SingleEdit";
import { schema, getUiSchema } from "./components/DrawTargetEdit";
import LocalScreen from "../components/LocalScreen";

export default function Page() {
    return (
        <SingleEdit
            initialData={
                {
                    rows: 1,
                    columns: 1,
                    ranges: [],
                    highlightAssign: false
                } as DrawTargetOptions
            }
            name="Draw Target"
            schema={schema}
            uiSchemaFn={getUiSchema}
            typeCheck={isDrawTargetOptions}
            renderComponent={(data: DrawTargetOptions) => <LocalScreen screen={{
                type: "drawTarget",
                options: data,
                duration: 30
            }} />}
        />
    );
}