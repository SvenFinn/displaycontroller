import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { DrawTargetOptions } from "dc-screens-types";

export const schema: RJSFSchema = {
    type: "object",
    required: ["url"],
    properties: {
        "url": {
            type: "string",
            title: "URL",
            format: "uri",
        }
    }
};

export function getUiSchema(formData: DrawTargetOptions): UiSchema {
    return {};
}