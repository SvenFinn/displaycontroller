import { DbScreen } from "dc-screens-types";
import { all_ranges_free } from "./AllRangesFree";
import { meyton_available } from "./MeytonAvailable";
import { range_free } from "./RangeFree";
import { range_online } from "./RangeOnline";
import { ranges_free_count } from "./RangesFreeCount";
import { ranges_online_count } from "./RangesOnlineCount";
import { LocalClient } from "dc-db-local";
import { logger } from "dc-logger";

export async function checkCondition(localClient: LocalClient, screen: DbScreen): Promise<boolean> {
    if (screen.visibleFrom && screen.visibleFrom > new Date()) return false;
    if (screen.visibleUntil) {
        screen.visibleUntil.setDate(screen.visibleUntil.getDate() + 1);
        if (screen.visibleUntil < new Date()) return false;
    }
    if (!screen.conditions) return true;
    if (screen.conditions.conditions.length === 0) return true;
    const conditions = await Promise.all(screen.conditions.conditions.map(condition => {
        switch (condition.type) {
            case "all_ranges_free":
                return all_ranges_free(condition);
            case "meyton_available":
                return meyton_available(condition);
            case "range_free":
                return range_free(condition);
            case "range_online":
                return range_online(condition);
            case "ranges_free_count":
                return ranges_free_count(condition);
            case "ranges_online_count":
                return ranges_online_count(condition);
            default:
                logger.warn(`Invalid condition type: ${(condition as any).type}`);
                return Promise.resolve(false);
        }
    }));
    switch (screen.conditions.mode) {
        case "and":
            return conditions.every(c => c);
        case "or":
            return conditions.some(c => c);
        default:
            logger.warn(`Invalid condition mode: ${screen.conditions.mode}`);
            return false;
    }
}