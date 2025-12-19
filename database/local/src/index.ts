import dotenv from "dotenv";
import { PrismaClient as LocalClient } from "./generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";


dotenv.config({ quiet: true });
if (!process.env.SELF_DB_URL) {
    console.error("SELF_DB_URL is not defined");
    process.exit();
}

export { PrismaClient as LocalClient } from "./generated/client.js";
export function createLocalClient(): LocalClient {
    const adapter = new PrismaPg({ connectionString: process.env.SELF_DB_URL });
    return new LocalClient({ adapter });
}
