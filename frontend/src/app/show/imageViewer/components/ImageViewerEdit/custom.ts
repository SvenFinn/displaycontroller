import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { schema as baseSchema, getUiSchema as getBaseUiSchema } from '.';
import { isViewerOptions, ViewerOptions } from 'dc-screens-types';

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
    options: any
): options is CustomViewerOptions {
    if (!isViewerOptions(options)) return false;
    return (
        //@ts-expect-error
        typeof options.duration === 'number' &&
        //@ts-expect-error
        options.duration > 0 &&
        Object.keys(options).includes('duration')
    );
}