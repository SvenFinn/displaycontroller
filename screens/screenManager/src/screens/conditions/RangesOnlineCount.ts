import { ConditionMinMax } from "dc-screens-types";
import { logger } from "dc-logger";

export async function ranges_online_count(condition: ConditionMinMax): Promise<boolean> {
    const onlineRanges = await fetch("http://ranges:80/api/ranges/");
    if (onlineRanges.status !== 200) {
        logger.warn("Failed to fetch online ranges");
        return false;
    }
    try {
        const ranges = await onlineRanges.json();
        return ranges.length >= condition.min && ranges.length <= condition.max;
    } catch (e) {
        logger.warn("Failed to parse ranges response");
        return false;
    }
}