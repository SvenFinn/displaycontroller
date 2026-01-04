import { promises as fs } from "fs";
import { DirectoryListing } from ".";

export async function scanDirectory(path: string): Promise<DirectoryListing> {
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
                    files: await scanDirectory(`${path}/${file}`)
                }
            }
            return {
                name: file,
                size: stats.size || 0,
                lastModified: stats.mtime || new Date(),
                type: "file"
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
