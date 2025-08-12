import { ConditionNone } from "dc-screens-types";
import { logger } from "dc-logger";

export async function all_ranges_free(condition: ConditionNone): Promise<boolean> {
    const onlineRangesReq = await fetch("http://ranges:80/api/ranges");
    const freeRangesReq = await fetch("http://ranges:80/api/ranges/free");
    if (onlineRangesReq.status !== 200 || freeRangesReq.status !== 200) {
        logger.warn("Failed to fetch online or free ranges");
        return false;
    }
    try {
        const onlineRanges = await onlineRangesReq.json();
        const freeRanges = await freeRangesReq.json();
        if (!Array.isArray(onlineRanges) || !Array.isArray(freeRanges)) {
            logger.warn("Invalid ranges response");
            return false;
        }
        return onlineRanges.length === freeRanges.length;
    } catch (e) {
        logger.error(`Failed to parse ranges response: ${e}`);
        return false;
    }
}