import { ConditionNumber } from "dc-screens-types";
import { isRange } from "dc-ranges/types"
import { logger } from "dc-logger";
import { request } from "dc-endpoints";
import { getRange } from "dc-ranges/endpoints";

export async function range_online(condition: ConditionNumber): Promise<boolean> {
    const range = await request("http://ranges:80", getRange, { rangeId: condition.number.toString() });
    if (range.type === "error" || !range.body) {
        logger.warn("Failed to fetch range");
        return false;
    }
    return range.body.active;
}