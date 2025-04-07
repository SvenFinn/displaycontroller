import * as fs from "fs";
import { DirectoryListing } from ".";

export async function scanDirectory(path: string): Promise<DirectoryListing> {
    if (!fs.existsSync(path)) {
        return [];
    }
    const files = await fs.promises.readdir(path);
    return await Promise.all(
        files.map(async (file) => {
            const stats = await fs.promises.lstat(`${path}/${file}`);
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

export function flattenFileList(listing: DirectoryListing, path: string = ""): string[] {
    return listing.flatMap((item) => {
        if (item.type === "file") {
            return `${path}/${item.name}`;
        }
        return flattenFileList(item.files, `${path}/${item.name}`);
    });
}
