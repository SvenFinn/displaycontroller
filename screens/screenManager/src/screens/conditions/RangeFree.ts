import { ConditionNumber } from "@shared/screens/conditions/base";
import { isRange } from "@shared/ranges"
import { logger } from "dc-logger";

export async function range_free(condition: ConditionNumber): Promise<boolean> {
    const rangeReq = await fetch(`http://ranges:80/api/ranges/${condition.number}`);
    if (rangeReq.status !== 200) {
        logger.warn("Failed to fetch free ranges");
        return false;
    }
    try {
        const range = await rangeReq.json();
        if (!isRange(range)) {
            logger.warn("Invalid range response");
            return false;
        }
        return !range.active || range.shooter === null;
    }
    catch (e) {
        return false;
    }
}

