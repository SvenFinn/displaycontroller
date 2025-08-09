import { useEffect, useState } from "react"
import SelectWithCustom from "../SelectWithCustom";
import { WidgetProps } from "@rjsf/utils";
import { JSONSchema7TypeName } from "json-schema";
import { useHost } from "@frontend/app/hooks/useHost";

export default function SingleRangeSelector(props: WidgetProps) {
    const [ranges, setRanges] = useState<(number | null)[]>([null]);
    const host = useHost();

    useEffect(() => {
        if (!host) {
            return;
        }
        async function fetchRanges() {
            const url = `${host}/api/ranges`;
            const response = await fetch(url);
            if (!response.ok) {
                console.error("Failed to fetch ranges");
                return;
            }
            const data = await response.json();
            data.push(null);
            setRanges(data);
        }
        fetchRanges();
    }, [host]);

    if (!host) {
        return <></>;
    }
    const enumOptions = ranges.map((range) => {
        return { label: range === null ? "None" : range.toString(), value: range };
    });
    const options = { ...props.options, enumOptions };
    const schema = { ...props.schema, type: ["number", "null"] as JSONSchema7TypeName[] };
    props = { ...props, options, schema };
    return <SelectWithCustom {...props} />
}
