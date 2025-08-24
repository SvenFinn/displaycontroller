import { ConditionMinMax } from "dc-screens-types";
import { logger } from "dc-logger";

export async function ranges_free_count(condition: ConditionMinMax): Promise<boolean> {
    if (condition.min === null) condition.min = Number.MIN_SAFE_INTEGER;
    if (condition.max === null) condition.max = Number.MAX_SAFE_INTEGER;

    const freeRanges = await fetch("http://ranges:80/api/ranges/free");
    if (freeRanges.status !== 200) {
        logger.warn("Failed to fetch free ranges");
        return false;
    }
    try {
        const ranges = await freeRanges.json();
        return ranges.length >= condition.min && ranges.length <= condition.max;
    } catch (e) {
        logger.warn("Failed to parse ranges response");
        return false;
    }
    return true;
}
