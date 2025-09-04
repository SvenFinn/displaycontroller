import { PrismaClient as Ssmdb2Client } from '../generated/client';
import { LocalClient } from "dc-db-local";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.SM_DB_USER || !process.env.SM_DB_PASS) {
    throw new Error("Please provide the SM_DB_USER and SM_DB_PASS environment variables");
}

export { PrismaClient as Ssmdb2Client } from '../generated/client';

export async function createSSMDB2Client(local?: LocalClient): Promise<Ssmdb2Client> {
    if (!local) {
        local = new LocalClient();
    }
    const server = (await local.parameter.findUnique({
        where: {
            key: "SM_SERVER_IP"
        }
    }))?.strValue;
    if (!server) {
        throw new Error("SM_SERVER_IP parameter not found");
    }
    const smdbClient = new Ssmdb2Client({
        datasources: {
            db: {
                url: `mysql://${process.env.SM_DB_USER}:${process.env.SM_DB_PASS}@${server}:3306/SSMDB2`
            }
        }
    });
    return smdbClient;
}