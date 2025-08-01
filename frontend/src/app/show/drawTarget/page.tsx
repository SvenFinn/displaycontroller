"use client";

import { DrawTargetOptions, isDrawTargetOptions } from "@shared/screens/drawTarget";
import DrawTarget from "./components/DrawTarget/drawTarget";
import SingleEdit from "../components/SingleEdit";
import { schema, getUiSchema } from "./components/DrawTargetEdit";

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
            renderComponent={(data: DrawTargetOptions) => <DrawTarget options={data} />}
        />
    );
}