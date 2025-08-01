import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { schema as baseSchema, getUiSchema as getBaseUiSchema } from '.';
import { ViewerOptions } from '@shared/screens/imageViewer';

export const schema: RJSFSchema = {
    ...baseSchema,
    required: [...baseSchema.required || [], "duration"],
    properties: {
        ...baseSchema.properties,
        duration: {
            type: "number",
            title: "Duration per Evaluation (seconds)",
            default: 30,
        },
    },
}

export function getUiSchema(formData: ViewerOptions): UiSchema {
    const baseUiSchema = getBaseUiSchema(formData);
    return baseUiSchema;
}

export type CustomViewerOptions = ViewerOptions & {
    duration: number;
};

export function isCustomViewerOptions(
    options: ViewerOptions
): options is CustomViewerOptions {
    return (
        //@ts-expect-error
        typeof options.duration === 'number' &&
        //@ts-expect-error
        options.duration > 0 &&
        Object.keys(options).includes('duration')
    );
}