import { DirectoryListing, isDirectoryListing } from ".";

export function flattenFileList(listing: DirectoryListing, path: string = ""): string[] {
    return listing.flatMap((item) => {
        if (item.type === "file") {
            return `${path}/${item.name}`;
        }
        return flattenFileList(item.files, `${path}/${item.name}`);
    });
}

export async function createFileList(path: string, baseURL: URL): Promise<string[]> {
    try {
        const files = await fetch(new URL(path, baseURL));
        if (!files.ok) return [path];
        // Check if the response is a JSON object or HTML
        const contentType = files.headers.get("content-type");
        if (!contentType) return [path];
        if (!contentType.includes("application/json")) return [path];
        const fileList = await files.json();
        if (!isDirectoryListing(fileList)) return [path];
        return flattenFileList(fileList, path);
    } catch (e) {
        return [path];
    }
}
