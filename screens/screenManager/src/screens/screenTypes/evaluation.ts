import { Screens } from ".";
import { EvaluationDbScreen } from "dc-screens/types";
import { logger } from "dc-logger";
import { request } from "dc-endpoints/client";
import { getEvaluations } from "dc-screens/endpoints";
import { getAccessPaths } from "dc-screens/files";


export default async function evaluation(screen: EvaluationDbScreen): Promise<Screens> {
    if (!screen.options.path) {
        return [];
    }

    const response = await request("http://evaluations", getEvaluations, {
        pathSegments: screen.options.path.split("/").filter(segment => segment.length > 0)
    });

    if (response.type === "error") {
        logger.error(`Failed to fetch evaluation metadata for screen ${screen.id}: ${response.message}`);
        return [];
    }
    if (!response.body) {
        logger.error(`Failed to fetch evaluation metadata for screen ${screen.id}: No response body`);
        return [];
    }
    const files = getAccessPaths(response.body);

    return files.map((file: string, index: number) => {
        return {
            available: true,
            id: screen.id,
            subId: index,
            type: "evaluation",
            options: {
                path: file
            },
            duration: screen.duration
        }
    });
}
