"use client";

import 'bootstrap/dist/css/bootstrap.min.css';
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import Form from "@rjsf/react-bootstrap";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";
import DrawTargetEdit from "./ranges";
import { DrawTargetOptions, isDrawTargetOptions } from "@shared/screens/drawTarget";

export interface DrawTargetEditProps {
    options?: DrawTargetOptions,
    onSubmit: (data: DrawTargetOptions) => void;
}

export default function Page({ options, onSubmit }: DrawTargetEditProps) {
    const [formData, setFormData] = useState<DrawTargetOptions>(options || {
        rows: 1,
        columns: 1,
        ranges: [],
        highlightAssign: false
    } as DrawTargetOptions
    )

    const schema: RJSFSchema = {
        type: "object",
        title: "Draw Target",
        required: ["rows", "columns", "ranges", "highlightAssign"],
        properties: {
            "rows": {
                type: "integer",
                title: "Rows",
                default: 1,
                minimum: 1,
                maximum: 10,
            },
            "columns": {
                type: "integer",
                title: "Columns",
                default: 1,
                minimum: 1,
                maximum: 10,
            },
            "ranges": {
                type: "array",
                title: "Ranges",
                items: {
                    type: ["number", "null"],
                }
            },
            "highlightAssign": {
                type: "boolean",
                title: "Highlight newly assigned ranges",
                default: false
            }
        }
    };

    const uiSchema: UiSchema = {
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
            "ui:widget": DrawTargetEdit,
            "ui:options": {
                rows: formData.rows,
                columns: formData.columns,
            }
        },

    }

    return (
        <Form schema={schema} uiSchema={uiSchema} validator={validator} formData={formData} onChange={(data) => setFormData(data.formData)
        } onSubmit={(data) => {
            if (!isDrawTargetOptions(data.formData)) {
                console.error("Invalid form data for DrawTargetOptions", data.formData);
                return;
            }
            onSubmit(data.formData as DrawTargetOptions);
        }} />
    );
}