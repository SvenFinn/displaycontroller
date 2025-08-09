"use client";

import { WidgetProps } from "@rjsf/utils";
import CreateableSelect from "react-select/creatable";

export default function SelectWithCustom({ value, onChange, options, schema }: WidgetProps) {
    const enumOptions = options.enumOptions || [];
    let dataTypes: string[] = [];
    if (Array.isArray(schema.type)) {
        dataTypes = schema.type as string[];
    } else if (schema.type) {
        dataTypes = [schema.type as string];
    } else {
        dataTypes = ["string"];
    }
    let enumValue = enumOptions.find((option) => option.value === value) || null;
    if (!enumValue) {
        enumValue = { label: value, value };
    }


    function validateInput(inputValue: string) {
        if (enumOptions.some((option) => option.value == inputValue)) {
            return false;
        }
        return dataTypes.some((dataType: string) => {
            // Check if the input value is valid based on the data type
            if (dataType === "null") {
                return false;
            }
            if (dataType === "number") {
                return !isNaN(Number(inputValue));
            } else if (dataType === "integer") {
                return Number.isInteger(Number(inputValue));
            } else if (dataType === "boolean") {
                return inputValue === "true" || inputValue === "false";
            }
            return true;
        });
    }

    return (
        <CreateableSelect isClearable={false} isMulti={false} options={enumOptions} value={enumValue} onChange={(selectedOption) => {
            if (selectedOption) {
                onChange(selectedOption.value);
            }
        }} formatCreateLabel={(inputValue: string) => inputValue} isValidNewOption={(inputValue: string) => validateInput(inputValue)} />
    )
} 