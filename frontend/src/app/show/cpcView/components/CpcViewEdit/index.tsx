import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { CpcViewOptions } from "dc-screens-types";

export const schema: RJSFSchema = {
    type: "object",
    title: "CPC View",
    required: ["rows", "columns", "ranges", "highlightAssign"],
    properties: {
        "rows": {
            type: "integer",
            title: "Zeilen",
            default: 1,
            minimum: 1,
        },
        "columns": {
            type: "integer",
            title: "Spalten",
            default: 1,
            minimum: 1,
        },
        "ranges": {
            type: "array",
            title: "Stände",
            items: {
                type: ["number", "null"],
            }
        }
    }
};

export function getUiSchema(formData: CpcViewOptions): UiSchema {
    return {
        "ui:field": "LayoutGridField",
        "ui:layoutGrid": {
            "ui:row": {
                "className": "row",
                "children": [
                    {
                        "ui:col": {
                            "children": [

                                {
                                    "ui:row": {
                                        "className": "row",
                                        "children": [
                                            {
                                                "ui:col": {
                                                    "children": [
                                                        "rows",
                                                    ]
                                                }
                                            },
                                            {
                                                "ui:col": {
                                                    "children": [
                                                        "columns",
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    "ui:row": {
                                        "className": "row",
                                        "children": [
                                            {
                                                "ui:columns": {
                                                    "children": [
                                                        "ranges",
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    "ui:row": {
                                        "className": "row",
                                        "children": [
                                            {
                                                "ui:col": {
                                                    "children": [
                                                        "highlightAssign",
                                                    ]
                                                }
                                            },

                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
        },
        "ranges": {
            "ui:widget": "RangesGrid",
            "ui:options": {
                rows: formData.rows,
                columns: formData.columns,
            }
        },

    }
}