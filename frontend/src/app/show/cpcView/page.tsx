"use client";

import { CpcViewOptions, isCpcViewOptions } from "dc-screens-types";
import CpcView from "./components/CpcView";
import SingleEdit from "../components/SingleEdit";
import { schema, getUiSchema } from "./components/CpcViewEdit";

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
            renderComponent={(data: CpcViewOptions) => <CpcView options={data} />}
        />
    );
}