import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { EmbedOptions } from "dc-screens-types";

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

export function getUiSchema(formData: EmbedOptions): UiSchema {
    return {};
}