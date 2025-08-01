import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { EvaluationOptions } from "@shared/screens/evaluation";

export const schema: RJSFSchema = {
    type: "object",
    required: ["path"],
    properties: {
        "path": {
            type: "string",
            title: "Path",
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