import { Screens } from ".";
import { EvaluationDbScreen } from "dc-screens-types";
import { isDirectoryListing } from "@shared/files";
import { logger } from "dc-logger";
import { flattenFileList } from "@shared/files/helpers";

export default async function evaluation(screen: EvaluationDbScreen): Promise<Screens> {
    let fileList: string[];
    try {
        fileList = await createFileList(screen.options.path);
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


async function createFileList(path: string): Promise<string[]> {
    try {
        const files = await fetch(`http://evaluations/api/evaluations/${path}`);
        if (!files.ok) return [path];
        // Check if the response is a JSON object or HTML
        const contentType = files.headers.get("content-type");
        if (!contentType) return [path];
        if (!contentType.includes("application/json")) return [path];
        const fileList = await files.json();
        if (!isDirectoryListing(fileList)) return [path];
        return flattenFileList(fileList, path);
    } catch (e) {
        logger.error(`Failed to fetch files for path ${path}`);
        return [path];
    }
}
