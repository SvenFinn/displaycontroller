import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { schema as baseSchema, getUiSchema as getBaseUiSchema } from '.';
import { EvaluationOptions } from 'dc-screens-types';
import { isEvaluationOptions } from 'dc-screens-types/dist/evaluation';

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

export function getUiSchema(formData: EvaluationOptions): UiSchema {
    const baseUiSchema = getBaseUiSchema(formData);
    return baseUiSchema;
}

export type CustomEvaluationOptions = EvaluationOptions & {
    duration: number;
};

export function isCustomEvaluationOptions(
    options: any
): options is CustomEvaluationOptions {
    if (!isEvaluationOptions(options)) return false;
    return (
        //@ts-expect-error
        typeof options.duration === 'number' &&
        //@ts-expect-error
        options.duration > 0 &&
        Object.keys(options).includes('duration')
    );
}