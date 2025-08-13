import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { EvaluationOptions } from "dc-screens-types";

export const schema: RJSFSchema = {
    type: "object",
    required: ["path"],
    properties: {
        "path": {
            type: "string",
            title: "Pfad",
            default: "",
        }
    }
};

export function getUiSchema(formData: EvaluationOptions): UiSchema {
    return {
        "path": {
            "ui:widget": "EvaluationSelector",
        },
    }
};