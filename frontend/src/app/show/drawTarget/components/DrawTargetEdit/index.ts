import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { DrawTargetOptions } from "dc-screens-types";

export const schema: RJSFSchema = {
    type: "object",
    title: "Draw Target",
    required: ["rows", "columns", "ranges", "highlightAssign"],
    properties: {
        "rows": {
            type: "integer",
            title: "Zeilen",
            description: "Anzahl der Zeilen",
            default: 1,
            minimum: 1,
        },
        "columns": {
            type: "integer",
            title: "Spalten",
            description: "Anzahl der Spalten",
            default: 1,
            minimum: 1,
        },
        "ranges": {
            type: "array",
            title: "Stände",
            description: " ",
            items: {
                type: ["number", "null"],
            }
        },
        "highlightAssign": {
            type: "boolean",
            title: "Neu belegte Stände hervorheben",
            description: "Neu belegte Stände werden durch orangenes Blinken hervorgehoben.",
            default: false
        }
    }
};

export function getUiSchema(formData: DrawTargetOptions): UiSchema {
    return {
        "ui:title": "Draw Target Options",
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
        highlightAssign: {
            "ui:widget": "select",
        }
    }
}