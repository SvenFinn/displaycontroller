import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { PrismaClient } from "../generated/client";

export { PrismaClient as LocalClient } from "../generated/client";

export async function createLocalClient(): Promise<PrismaClient> {
    return new PrismaClient();
}