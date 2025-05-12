import { fetchSamba } from './smb';
import fs from 'fs';
import { rewriteHTML } from './html';
import path from 'path';



export async function sync(serverIp: string, smbPath: string, convPath: string, htmlPath: string) {
    const syncWorked = await fetchSamba(serverIp, smbPath);
    if (!syncWorked) {
        return;
    }
    await rewriteHTML(smbPath, convPath);
    if (fs.existsSync(htmlPath)) {
        const files = await fs.promises.readdir(htmlPath);
        for (const file of files) {
            const filePath = path.join(htmlPath, file);
            await fs.promises.rm(filePath, { recursive: true });
        }
    }
    await fs.promises.mkdir(htmlPath, { recursive: true });
    await fs.promises.cp(convPath, htmlPath, { recursive: true });
}
