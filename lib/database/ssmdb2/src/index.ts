import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient as Ssmdb2Client } from './generated/client.js';
import { createLocalClient, LocalClient } from "dc-db-local";
import { config } from "dotenv";
config({ quiet: true });

if (!process.env.SM_DB_USER || !process.env.SM_DB_PASS) {
    throw new Error("Please provide the SM_DB_USER and SM_DB_PASS environment variables");
}

export { PrismaClient as Ssmdb2Client } from './generated/client.js';

export async function createSSMDB2Client(local?: LocalClient): Promise<Ssmdb2Client> {
    if (!local) {
        local = createLocalClient();
    }
    const server = (await local.parameter.findUnique({
        where: {
            key: "SM_SERVER_IP"
        }
    }))?.strValue;
    if (!server) {
        throw new Error("SM_SERVER_IP parameter not found");
    }
    const adapter = new PrismaMariaDb({
        host: server,
        port: 3306,
        user: process.env.SM_DB_USER,
        password: process.env.SM_DB_PASS,
        database: "SSMDB2"
    });
    const smdbClient = new Ssmdb2Client({ adapter });
    return smdbClient;
}