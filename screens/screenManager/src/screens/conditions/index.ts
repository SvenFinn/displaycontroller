import { DbScreen, isDbScreen } from "@shared/screens";
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
    if (!screen.condition) return true;
    switch (screen.condition.type) {
        case "all_ranges_free":
            return all_ranges_free(screen.condition);
        case "meyton_available":
            return meyton_available(screen.condition);
        case "range_free":
            return range_free(screen.condition);
        case "range_online":
            return range_online(screen.condition);
        case "ranges_free_count":
            return ranges_free_count(screen.condition);
        case "ranges_online_count":
            return ranges_online_count(screen.condition);
        default:
            // @ts-ignore
            logger.warn(`Invalid condition type: ${screen.condition.type}`)
            return false;
    }
}