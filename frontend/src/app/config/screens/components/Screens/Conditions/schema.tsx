import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { Conditions } from "dc-screens-types/dist/conditions";

export const schema: RJSFSchema = {
    title: "Bedingungen",
    type: "object",
    properties: {
        mode: {
            type: "string",
            oneOf: [
                { const: "and", title: "Alle Bedingungen müssen erfüllt sein" },
                { const: "or", title: "Mindestens eine Bedingung muss erfüllt sein" }
            ],
            default: "and"
        },
        conditions: {
            type: "array",
            items: {
                required: ["type"],
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        oneOf: [
                            { const: "ranges_free_count", title: "Anzahl freier Stände" },
                            { const: "ranges_online_count", title: "Anzahl aktiver Stände" },
                            { const: "range_free", title: "Stand frei" },
                            { const: "range_online", title: "Stand aktiv" },
                            { const: "all_ranges_free", title: "Alle Stände frei" },
                            { const: "meyton_available", title: "Meyton verfügbar" }
                        ]
                    },
                    invert: {
                        type: "boolean",
                        default: false

                    },
                },
                allOf: [
                    {
                        if: {
                            properties: {
                                type: {
                                    enum: ["ranges_free_count", "ranges_online_count"]
                                }
                            }
                        },
                        then: {
                            properties: {
                                min: {
                                    type: "number",
                                    default: 0
                                },
                                max: {
                                    type: "number",
                                    default: 10
                                }
                            },
                            required: ["min", "max"]
                        }
                    },
                    {
                        if: {
                            properties: {
                                type: {
                                    enum: ["range_free", "range_online"]
                                }
                            }
                        },
                        then: {
                            properties: {
                                number: {
                                    type: "number",
                                    default: 0
                                }
                            },
                            required: ["number"]
                        }

                    }
                ]
            },
        }
    },
    required: ["mode"]
}

export function getUiSchema(data: Conditions): UiSchema {
    return {
        "ui:order": ["mode", "conditions"],
        mode: {
            "ui:options": {
                label: false
            }
        },
        conditions: {
            "ui:options": {
                orderable: false,
                label: false,
            },
            items: {
                "ui:field": "LayoutGridField",
                "ui:layoutGrid": {
                    "ui:row": [
                        {
                            "ui:col": {
                                "children": [
                                    "invert"
                                ]
                            }
                        },
                        {
                            "ui:col": {
                                "children": [
                                    "type"
                                ]
                            }
                        },
                        {
                            "ui:col": {
                                "children": [
                                    "min",
                                    "number"
                                ]
                            }
                        },
                        {
                            "ui:col": {
                                "children": [
                                    "max",
                                ]
                            }
                        }
                    ]
                },
                invert: {
                    "ui:widget": "select",
                    "ui:options": {
                        enumNames: [
                            "Wenn nicht",
                            "Wenn"
                        ],
                        label: false,
                    }
                },
                type: {
                    "ui:options": {
                        label: false,
                    }
                },
                min: {
                    "ui:options": {
                        label: false,
                    },
                    "ui:help": "Minimale Anzahl"

                },
                max: {
                    "ui:options": {
                        label: false,
                    },
                    "ui:help": "Maximale Anzahl"
                },
                number: {
                    "ui:options": {
                        label: false,
                    },
                    "ui:widget": "SingleRangeSelector",
                    "ui:help": "Stand Nummer"
                }
            }
        }
    }
}