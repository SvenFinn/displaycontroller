import { Screens } from ".";
import { EvaluationGalleryDbScreen } from "@shared/screens/evaluationGallery";
import { logger } from "dc-logger";
import { DirectoryListing, isDirectoryListing } from "@shared/files";

export default async function evaluationGallery(screen: EvaluationGalleryDbScreen): Promise<Screens> {
    const fileList = await createFileList(screen.options.path);
    const screens = fileList.map((file: string, index: number) => {
        return {
            available: true,
            id: screen.id,
            subId: index,
            preset: "evaluation",
            options: {
                file: file
            },
            duration: screen.duration
        }
    });
    if (screens.length === 0) {
        logger.warn(`No files found in path ${screen.options.path}`);
        return []
    }
    /*@ts-ignore*/
    return screens;
}

async function createFileList(path: string): Promise<string[]> {
    try {
        const files = await fetch(`http://evaluations/api/evaluations/${path}`);
        if (!files.ok) return [];
        // Check if the response is a JSON object or HTML
        const contentType = files.headers.get("content-type");
        if (!contentType) return [];
        if (!contentType.includes("application/json")) return [];
        const fileList = await files.json();
        if (!isDirectoryListing(fileList)) return [];
        return flattenFileList(fileList);
    } catch (e) {
        logger.error(`Failed to fetch files for path ${path}`);
        return [];
    }
}

function flattenFileList(listing: DirectoryListing, path: string = ""): string[] {
    return listing.flatMap((item) => {
        if (item.type === "file") {
            return `${path}/${item.name}`;
        }
        return flattenFileList(item.files, `${path}/${item.name}`);
    });
}
