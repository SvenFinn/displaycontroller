import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { ViewerOptions } from "@shared/screens/imageViewer";

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

export function getUiSchema(formData: ViewerOptions): UiSchema {
    return {
        "path": {
            "ui:widget": "ImageSelector",
        },
    }
};