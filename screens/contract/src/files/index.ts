import { createIs } from "typia";

export * from "./helpers.js";

export type DirectoryListing = Array<File | Folder>;

export type File = {
    name: string;
    size: number;
    lastModifiedMs: number;
    type: "file";
    accessPath: string;
}

export type Folder = {
    name: string;
    type: "folder";
    children: DirectoryListing;
}

export const isDirectoryListing = createIs<DirectoryListing>();