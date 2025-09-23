import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "dc-logger";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

if (!process.env.SM_SMB_USER || !process.env.SM_SMB_PASS) {
    logger.error("SMB credentials are not set in environment variables.");
    process.exit(1);
}

export async function fetchSamba(host: string, folder: string): Promise<boolean> {
    if (fs.existsSync(folder)) {
        await fs.promises.rm(folder, { recursive: true });
    }
    await fs.promises.mkdir(folder, { recursive: true });
    logger.info(`Fetching HTML files from ${host} to ${folder}`);
    try {
        const { stderr } = await (promisify(exec))(`smbclient --user="${process.env.SM_SMB_USER}" --password="${process.env.SM_SMB_PASS}" \\\\\\\\${host}\\\\ergebnis -c "lcd ${folder};prompt off; recurse on; mget html*;exit"`);
        logger.debug(stderr);
        return true;
    } catch (e) {
        logger.error(e);
        return false;
    }
}
