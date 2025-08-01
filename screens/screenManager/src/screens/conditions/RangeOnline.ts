import { ConditionNumber } from "@shared/screens/conditions/base";
import { isRange } from "@shared/ranges"
import { logger } from "dc-logger";

export async function range_online(condition: ConditionNumber): Promise<boolean> {
    const rangeReq = await fetch(`http://ranges:80/api/ranges/${condition.number}`);
    if (rangeReq.status !== 200) {
        logger.warn("Failed to fetch online ranges");
        return false;
    }
    try {
        const range = await rangeReq.json();
        if (!isRange(range)) {
            logger.warn("Invalid range response");
            return false;
        }
        return range.active;
    }
    catch (e) {
        logger.error("Failed to parse range response", e);
        return false;
    }
}