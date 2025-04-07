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

export type File = {
    name: string;
    size: number;
    lastModified: Date;
    type: "file";
}

export type Folder = {
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