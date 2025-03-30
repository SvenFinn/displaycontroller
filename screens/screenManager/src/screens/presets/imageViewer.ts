import { Screens } from ".";
import { ViewerDbScreen } from "@shared/screens/imageViewer";

import { logger } from "dc-logger";
import { DirectoryListing, isDirectoryListing } from "@shared/files";

export default async function imageViewer(screen: ViewerDbScreen): Promise<Screens> {
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
            preset: "imageViewer",
            options: {
                file: file
            },
            duration: screen.duration
        }
    });
}

async function createFileList(path: string): Promise<string[]> {
    try {
        const files = await fetch(`http://images/api/images/${path}`);
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
