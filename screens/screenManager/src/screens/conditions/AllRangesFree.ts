import { ConditionNone } from "dc-screens-types";
import { logger } from "dc-logger";
import { request } from "dc-endpoints";
import { getActiveRanges, getFreeRanges } from "dc-ranges/endpoints";

export async function all_ranges_free(condition: ConditionNone): Promise<boolean> {
    const activeRanges = await request("http://ranges:80", getActiveRanges);
    const freeRanges = await request("http://ranges:80", getFreeRanges);
    if (activeRanges.type === "error" || freeRanges.type === "error") {
        logger.warn("Failed to fetch active or free ranges");
        return false;
    }
    return activeRanges.body?.length === freeRanges.body?.length;
}