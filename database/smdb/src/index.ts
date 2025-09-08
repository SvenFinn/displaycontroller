import { PrismaClient as SmdbClient } from '../generated/client';
import { LocalClient } from "dc-db-local";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

if (!process.env.SM_DB_USER || !process.env.SM_DB_PASS) {
    throw new Error("Please provide the SM_DB_USER and SM_DB_PASS environment variables");
}

export { PrismaClient as SmdbClient } from '../generated/client';

export async function createSMDBClient(local?: LocalClient): Promise<SmdbClient> {
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
    const smdbClient = new SmdbClient({
        datasources: {
            db: {
                url: `mysql://${process.env.SM_DB_USER}:${process.env.SM_DB_PASS}@${server}:3306/SMDB`
            }
        }
    });
    return smdbClient;
}