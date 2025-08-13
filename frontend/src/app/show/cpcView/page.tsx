"use client";

import { CpcViewOptions, isCpcViewOptions } from "dc-screens-types";
import SingleEdit from "../components/SingleEdit";
import { schema, getUiSchema } from "./components/CpcViewEdit";
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
                } as CpcViewOptions
            }
            name="CpcView"
            schema={schema}
            uiSchemaFn={getUiSchema}
            typeCheck={isCpcViewOptions}
            renderComponent={(data: CpcViewOptions) => <LocalScreen screen={{
                type: "cpcView",
                options: data,
                duration: 30
            }} />}
        />
    );
}