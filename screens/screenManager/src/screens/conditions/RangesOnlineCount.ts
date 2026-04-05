import { ConditionMinMax } from "dc-screens-types";
import { logger } from "dc-logger";
import { request } from "dc-endpoints";
import { getActiveRanges } from "dc-ranges/endpoints";

export async function ranges_online_count(condition: ConditionMinMax): Promise<boolean> {
    if (condition.min === null) condition.min = Number.MIN_SAFE_INTEGER;
    if (condition.max === null) condition.max = Number.MAX_SAFE_INTEGER;

    const onlineRanges = await request("http://ranges:80", getActiveRanges);
    if (onlineRanges.type === "error" || !onlineRanges.body) {
        logger.warn("Failed to fetch online ranges");
        return false;
    }
    return onlineRanges.body.length >= condition.min && onlineRanges.body.length <= condition.max;
}