import { DirectoryListing, isDirectoryListing } from ".";

export function flattenFileList(listing: DirectoryListing, path: string = ""): string[] {
    return listing.flatMap((item) => {
        if (item.type === "file") {
            return `${path}/${item.name}`;
        }
        return flattenFileList(item.files, `${path}/${item.name}`);
    });
}

export function sanitizePath(path: string): string | null {

    // SSRF prevention: validate/sanitize path input.
    // Only allow safe, relative file names (alphanumeric, _, -, ., and optionally / for subfolders).
    // Disallow path traversal, absolute path, suspicious characters.
    const SAFE_PATH_REGEX = /^([a-zA-Z0-9_\-./ ]+)$/;
    if (
        !path ||
        typeof path !== "string" ||
        path.includes("..") ||
        path.includes("//") ||
        path.startsWith("/") ||
        !SAFE_PATH_REGEX.test(path)
    ) {
        return null;
    }

    return path;
}


export async function createFileList(path: string, baseURL: URL): Promise<string[]> {
    const sanitizedPath = sanitizePath(path);
    if (!sanitizedPath) return [];
    try {
        const files = await fetch(new URL(sanitizedPath, baseURL));
        if (!files.ok) return [];
        // Check if the response is a JSON object or HTML
        const contentType = files.headers.get("content-type");
        if (!contentType) return [path];
        if (!contentType.includes("application/json")) return [path];
        const fileList = await files.json();
        if (!isDirectoryListing(fileList)) return [];
        return flattenFileList(fileList, path);
    } catch (e) {
        return [];
    }
}
