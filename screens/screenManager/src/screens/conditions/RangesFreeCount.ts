import { ConditionMinMax } from "dc-screens-types";
import { logger } from "dc-logger";
import { request } from "dc-endpoints";
import { getFreeRanges } from "dc-ranges/endpoints";

export async function ranges_free_count(condition: ConditionMinMax): Promise<boolean> {
    if (condition.min === null) condition.min = Number.MIN_SAFE_INTEGER;
    if (condition.max === null) condition.max = Number.MAX_SAFE_INTEGER;

    const freeRanges = await request("http://ranges:80", getFreeRanges);
    if (freeRanges.type === "error" || !freeRanges.body) {
        logger.warn("Failed to fetch free ranges");
        return false;
    }
    return freeRanges.body.length >= condition.min && freeRanges.body.length <= condition.max;
}
