"use client";

import { useEffect, useState } from "react"
import { WidgetProps } from "@rjsf/utils";
import CreateableSelect from "react-select/creatable";
import styles from "./ranges.module.css";
import Grid from "@frontend/app/show/components/Ranges/Grid";
import { useHost } from "@frontend/app/hooks/useHost";
import { request } from "dc-endpoints";
import { getActiveRanges } from "dc-ranges/endpoints";

interface Value {
    label: string;
    value: number | null;
}

export default function RangesGrid(props: WidgetProps) {
    const host = useHost();

    const { rows = 1, columns = 1 } = props.options || {};

    const rawValues = props.value as Array<number | null> || [];
    const values = Array.from({ length: rows * columns }, (_, i) =>
        typeof rawValues[i] === "number" ? rawValues[i] : null
    );

    useEffect(() => {
        // If the ranges array has been changed, update the props.onChange
        if (values.length != rawValues.length) {
            props.onChange(values);
        }
    }, [values, rawValues, props]);

    const [options, setOptions] = useState<Array<Value>>([{
        label: "None",
        value: null
    }]);
    useEffect(() => {
        for (const value of values) {
            if (value !== null && !options.some(opt => opt.value === value)) {
                setOptions([...options, {
                    label: value.toString(),
                    value: value
                }].sort((a, b) => {
                    if (a.value === null) return 1; // Place null at the end
                    if (b.value === null) return -1; // Place null at the end
                    return a.value - b.value; // Sort numerically
                }));
            }
        }
    }, [values, options]);

    useEffect(() => {
        if (!host) return;
        async function fetchRanges() {
            const ranges = await request(host, getActiveRanges);
            if (ranges.type === "error" || !ranges.body) {
                setOptions([{ label: "None", value: null }]);
                return;
            }
            const rangesData: Array<number | null> = ranges.body;
            rangesData.push(null);
            setOptions(rangesData.map(range => ({
                label: range === null ? "None" : range.toString(),
                value: range
            })).sort((a, b) => {
                if (a.value === null) return 1; // Place null at the end
                if (b.value === null) return -1;
                return a.value - b.value; // Sort numerically
            }));
        }
        fetchRanges();
    }, [host]);

    const handleChange = (id: number, option: Value | null) => {
        const value = option?.value || null; // Ensure value is a number or null
        const newValues = [...values];
        if (!value && value !== 0) {
            newValues[id] = null;
        } else {
            // Ensure value is a number or null
            if (isNaN(Number(value))) {
                console.warn("Invalid value selected, setting to null");
                newValues[id] = null;
            } else {
                newValues[id] = Number(value);
            }
        }
        props.onChange(newValues);
    };

    return (
        <Grid rows={rows} columns={columns} >
            {values.map((value, index) => (
                <div key={index} className={styles.editItem}>

                    <CreateableSelect
                        isClearable={false}
                        isMulti={false}
                        options={options}
                        value={options.find(opt => opt.value === value) || null}
                        onChange={(newValue) => handleChange(index, newValue)}
                        formatCreateLabel={(inputValue: string) => inputValue}
                        isValidNewOption={(inputValue: string) => {
                            if (Number.isNaN(Number(inputValue)))
                                return false; // Invalid input, do not allow creation
                            if (options.some(opt => opt.value === Number(inputValue)))
                                return false; // Already exists, do not allow creation
                            if (Number(inputValue) < 1)
                                return false; // Invalid range, do not allow creation
                            return true;
                        }}
                    />
                </div>
            ))}
        </Grid>
    );
}
