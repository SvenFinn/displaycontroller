import { promises as fs } from "fs";
import { spawn } from "child_process";
import { logger } from "dc-logger";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

if (!process.env.SM_SMB_USER || !process.env.SM_SMB_PASS) {
    logger.error("SMB credentials are not set in environment variables.");
    process.exit(1);
}

export async function fetchSamba(host: string, folder: string): Promise<void> {
    await fs.rm(folder, { recursive: true, force: true });
    await fs.mkdir(folder, { recursive: true });
    logger.info(`SMB pull: \\\\${host}\\ergebnis → ${folder}`);
    const credFilePath = await writeSmbCredentials();
    try {
        await new Promise<void>((resolve, reject) => {
            const p = spawn("smbclient", [
                `\\\\${host}\\ergebnis`,
                "--authentication-file",
                credFilePath.file,
                "-c",
                `lcd "${folder}";prompt off; recurse on; mget html*;exit`
            ], { stdio: "inherit" });
            p.on("error", reject);
            p.on("close", (code: number) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`smbclient exited with code ${code}`));
                }
            })
        });
    } finally {
        await fs.rm(credFilePath.dir, { recursive: true, force: true });
    }
}

async function writeSmbCredentials(): Promise<{ dir: string, file: string }> {
    const tempDir = await fs.mkdtemp("smb-cred-");
    const filePath = `${tempDir}/.smbcredentials`;
    const credContent = `
username=${process.env.SM_SMB_USER}
password=${process.env.SM_SMB_PASS}
`;
    await fs.writeFile(filePath, credContent, { mode: 0o600 });
    return { dir: tempDir, file: filePath };
}