import { ConditionMinMax } from "@shared/screens/conditions/base";
import { logger } from "dc-logger";

export async function ranges_free_count(condition: ConditionMinMax): Promise<boolean> {
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
