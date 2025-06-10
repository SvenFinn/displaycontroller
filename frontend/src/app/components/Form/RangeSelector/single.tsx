import { useEffect, useState } from "react"
import SelectWithCustom from "../SelectWithCustom";
import { WidgetProps } from "@rjsf/utils";

export default function SingleRangeSelector(props: WidgetProps) {
    const [ranges, setRanges] = useState<(number | null)[]>([]);

    useEffect(() => {
        async function fetchRanges() {
            const host = window.location.host.split(":")[0];
            const url = `http://${host}:${process.env.NEXT_PUBLIC_APP_PORT}/api/ranges`;
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
    }, []);
    const enumOptions = ranges.map((range) => {
        return { label: range === null ? "None" : range.toString(), value: range };
    });

    const options = { ...props.options, enumOptions };
    const schema = { ...props.schema, type: ["number", "null"] };
    props = { ...props, options, schema };
    return <SelectWithCustom {...props} />
}
