"use client";

import FormWrapper from "@frontend/app/components/Form"
import { getUiSchema as getConditionUiSchema, schema as conditionSchema } from "./Conditions/schema"
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { getSchema as getScreensSchema, getUiSchema as getScreensUiSchema } from "./schemas";
import { DbScreen, isDbScreen } from "dc-screens-types";
import styles from "./screenEdit.module.css";

interface ScreenEditProps {
    className?: string;
    screen: DbScreen | null;
    onSubmit: (data: DbScreen) => void;
    onChange?: (data: DbScreen) => void;
}


export default function ScreenEdit({ screen, onSubmit, onChange, className }: ScreenEditProps) {
    if (!screen) {
        return <div className={styles.error}>Keine Ansicht ausgewählt</div>;
    }
    function translateFromDbScreen(data: DbScreen) {
        return {
            ...data,
            duration: data.duration / 1000, // Convert from milliseconds to seconds
            conditions: data.conditions || {
                mode: "and",
                conditions: []
            },
        };
    }

    function translateToDbScreen(data: DbScreen): DbScreen {
        let screenData = JSON.parse(JSON.stringify(data)); // Deep clone to avoid mutation
        if (data.visibleFrom) {
            data.visibleFrom.setHours(0, 0, 0, 0);
        }
        if (data.visibleUntil) {
            data.visibleUntil.setHours(23, 59, 59, 999);
        }
        return {
            ...data,
            duration: data.duration * 1000, // Convert from seconds to milliseconds
            conditions: data.conditions?.conditions.length ? data.conditions : null,

        };
    }

    const screenData = translateFromDbScreen(screen);

    const schema: RJSFSchema = {
        type: "object",
        properties: {
            heading: {
                type: "object",
                title: `Ansicht ${screenData.id} - ${screenData.type}`,
            },
            id: {
                type: "integer",
            },
            type: {
                type: "string",
                // HIDDEN
            },
            options: {
                title: "",
                ...getScreensSchema(screenData),
            },
            duration: {
                type: "integer",
                title: "Dauer",
                description: "Dauer der Ansicht in Sekunden",
                default: 60,
                minimum: 1,
            },
            visibleFrom: {
                type: ["string", "null"],
                title: "Sichtbar ab",
                description: "Ansicht wird ab dem angegebenen Datum angezeigt",
                format: "date",
                default: null,
            },
            visibleUntil: {
                type: ["string", "null"],
                title: "Sichtbar bis",
                description: "Ansicht wird bis zum Ende des Tages angezeigt",
                format: "date",
                default: null,
            },
            conditions: conditionSchema,
        },
        required: ["id", "type", "options", "conditions", "duration"],
    }

    function getUiSchema(data: DbScreen): UiSchema {
        return {
            conditions: getConditionUiSchema(data.conditions!),
            options: getScreensUiSchema(data),
            "ui:field": "LayoutGridField",
            "ui:layoutGrid": {
                "ui:col": [
                    {
                        "ui:row": {
                            children: ["heading"]
                        }
                    },
                    {
                        "ui:row": {
                            children: ["options", "duration"]
                        }
                    },
                    {
                        "ui:row": {
                            children: [
                                {
                                    "ui:col": {
                                        children: ["visibleFrom"]
                                    }
                                },
                                {
                                    "ui:col": {
                                        children: ["visibleUntil"]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "ui:row": {
                            className: styles.conditions,
                            children: ["conditions"]
                        }
                    }
                ]
            },
            type: {
                "ui:widget": "hidden"
            },
            id: {
                "ui:widget": "hidden"
            }
        }
    }

    return (
        <FormWrapper
            onSubmit={(data) => onSubmit(translateToDbScreen(data))}
            onChange={onChange ? (data) => onChange(translateToDbScreen(data)) : undefined}
            schema={schema}
            uiSchemaFn={getUiSchema}
            initialData={screenData}
            typeCheck={isDbScreen}
            className={className}
        />
    )
}