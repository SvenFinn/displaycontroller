import { Screens } from ".";
import { EvaluationDbScreen } from "dc-screens-types";
import { logger } from "dc-logger";
import { createFileList } from "@shared/files/helpers";


export default async function evaluation(screen: EvaluationDbScreen): Promise<Screens> {
    if (!screen.options.path) {
        return [];
    }
    let fileList: string[];
    try {
        fileList = await createFileList(screen.options.path, new URL("http://evaluations/api/evaluations/"));
    } catch (e) {
        logger.error(`Failed to fetch files for screen ${screen.id}`);
        return [];
    }
    if (fileList.length < 1) return [];
    // Length of fileList is larger than 1, so this map always
    // returns at least one element
    // @ts-ignore
    return fileList.map((file: string, index: number) => {
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
