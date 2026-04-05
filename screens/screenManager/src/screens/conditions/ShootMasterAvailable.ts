import { ConditionNone } from "dc-screens-types";
import { logger } from "dc-logger";
import { request } from "dc-endpoints";
import { getServerState } from "dc-server-state/endpoints";

export async function shootmaster_available(condition: ConditionNone): Promise<boolean> {
    const serverState = await request("http://server-state:80", getServerState);

    if (serverState.type === "error" || !serverState.body) {
        logger.warn("Failed to fetch server state");
        return false;
    }
    return serverState.body;
}