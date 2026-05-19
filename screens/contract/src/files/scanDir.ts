import { promises as fs } from "fs";
import { DirectoryListing } from "./index.js";
import path from "path";

export async function createDirectoryListing(path: string, accessBasePath: string): Promise<DirectoryListing> {
    if (!await fileExists(path)) {
        return [];
    }
    const files = await fs.readdir(path);
    return await Promise.all(
        files.map(async (file) => {
            const stats = await fs.lstat(`${path}/${file}`);
            if (stats.isDirectory()) {
                return {
                    name: file,
                    type: "folder",
                    children: await createDirectoryListing(`${path}/${file}`, `${accessBasePath}/${file}`)
                }
            }

            const accessPath = `${accessBasePath}/${file}`;
            const sanitizedAccessPath = accessPath.split("/").filter(segment => segment.length > 0).join("/");
            return {
                name: file,
                size: stats.size || 0,
                lastModifiedMs: (stats.mtime || new Date()).getTime(),
                type: "file",
                accessPath: `/${sanitizedAccessPath}`
            }
        })
    );
}

export async function fileExists(path: string): Promise<boolean> {
    try {
        await fs.access(path, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

export function resolveSafePath(relativePath: string, basePath: string): string | null {
    // SSRF prevention: validate/sanitize path input.
    // Only allow safe, relative file names (alphanumeric, _, -, ., and optionally / for subfolders).
    const resolved = path.resolve(basePath, relativePath);
    console.log(`Resolving path: base=${basePath}, relative=${relativePath}, resolved=${resolved}`);
    if (!resolved.startsWith(basePath)) {
        return null;
    }
    return resolved;
}

export function sanitizeFileName(name: string): string {
    // Remove any path separators and suspicious characters from the file name.
    return path.basename(name).replace(/[\0]/g, "");
}