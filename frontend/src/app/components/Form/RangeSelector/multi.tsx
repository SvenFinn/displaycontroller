import { useEffect, useState } from "react"
import SelectWithCustom from "../SelectWithCustom";
import { WidgetProps } from "@rjsf/utils";
import { JSONSchema7TypeName } from "json-schema";
import { useHost } from "@frontend/app/hooks/useHost";

export default function MultiRangeSelector(props: WidgetProps) {
    const [ranges, setRanges] = useState<number[]>([]);
    const [selectedRanges, setSelectedRanges] = useState<number[]>(props.value || []);
    const host = useHost();
    if (host === "") {
        return <></>;
    }

    async function fetchRanges() {
        const url = `${host}/api/ranges`;
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Failed to fetch ranges");
            return;
        }
        const data = await response.json();
        setRanges(data);
    }

    useEffect(() => {
        fetchRanges();
    }, []);

    return (
        <div>
            {ranges.map((range, index) => {
                const id = Date.now() + index; // Unique ID for each checkbox
                const isChecked = selectedRanges.includes(range);
                return (
                    <>
                        <label key={index} htmlFor={id.toString()}>
                            Range {range}:
                        </label>
                        <input key={index} type="checkbox" id={id.toString()} checked={isChecked} onChange={
                            (e) => {
                                const checked = e.target.checked;
                                let newSelectedRanges = [...selectedRanges];
                                if (checked) {
                                    newSelectedRanges.push(range);
                                } else {
                                    newSelectedRanges = newSelectedRanges.filter(r => r !== range);
                                }
                                newSelectedRanges = newSelectedRanges.filter((r, i) => newSelectedRanges.indexOf(r) === i); // Remove duplicates
                                newSelectedRanges = newSelectedRanges.sort((a, b) => a - b); // Sort numerically
                                setSelectedRanges(newSelectedRanges);
                                props.onChange(newSelectedRanges);
                            }
                        } />
                    </>
                )
            })}
            <button type="button" onClick={() => fetchRanges()}>
                Refresh
            </button>

        </div>
    )
}
