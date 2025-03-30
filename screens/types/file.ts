import * as fs from "fs";

export type FileResponse = FileActionResponse | DirectoryListing;

export type FileActionResponse = {
    code: number;
    message: string;
};

export function isFileActionResponse(obj: any): obj is FileActionResponse {
    if (typeof obj !== "object") {
        return false;
    }
    return obj.code !== undefined && obj.message !== undefined;
}

export type DirectoryListing = Array<File | Folder>;

type File = {
    name: string;
    size: number;
    lastModified: Date;
    type: "file";
}

type Folder = {
    name: string;
    type: "folder";
    files: DirectoryListing;
}

export function isDirectoryListing(obj: any): obj is DirectoryListing {
    if (!Array.isArray(obj)) {
        return false;
    }
    for (const item of obj) {
        if (typeof item !== "object") {
            return false;
        }
        if (item.name === undefined || item.type === undefined) {
            return false;
        }
    }
    return true;
}

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