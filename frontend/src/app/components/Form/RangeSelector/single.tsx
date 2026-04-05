import { useEffect, useState } from "react"
import SelectWithCustom from "../SelectWithCustom";
import { WidgetProps } from "@rjsf/utils";
import { JSONSchema7TypeName } from "json-schema";
import { useHost } from "@frontend/app/hooks/useHost";
import { request } from "dc-endpoints";
import { getActiveRanges } from "dc-ranges/endpoints";

export default function SingleRangeSelector(props: WidgetProps) {
    const [ranges, setRanges] = useState<(number | null)[]>([null]);
    const host = useHost();

    useEffect(() => {
        if (!host) {
            return;
        }
        async function fetchRanges() {
            const ranges = await request(host, getActiveRanges);
            if (ranges.type === "error" || !ranges.body) {
                setRanges([null]);
                return;
            }
            const rangeValues: Array<number | null> = ranges.body;
            rangeValues.push(null);
            setRanges(rangeValues);
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
