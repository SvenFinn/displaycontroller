import { ConditionNone } from "@shared/screens/conditions/base";
import { logger } from "dc-logger";

export async function meyton_available(condition: ConditionNone): Promise<boolean> {
    const serverStateReq = await fetch("http://server-state:80/api/serverState");
    if (serverStateReq.status !== 200) {
        logger.warn("Failed to fetch server state");
        return false;
    }
    try {
        const serverState = await serverStateReq.json();
        return serverState;
    }
    catch (e) {
        logger.error(`Failed to parse server state: ${e}`);
        return false;
    }
}