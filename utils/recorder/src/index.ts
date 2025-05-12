import { EventSource } from "eventsource";
import { promises as fs } from "fs";
import { createInterface } from "readline";

const URL = "http://192.168.10.170:8080/api/ranges/sse";

async function main() {
    const handle = await fs.open("output.tmp.json", "w");
    const es = new EventSource(URL);
    es.onmessage = async (e) => {
        const data = JSON.parse(e.data);
        data.timestamp = new Date();
        await handle.write(JSON.stringify(data) + "\n");
    };
    es.onopen = () => {
        console.log("Connected to server");
    }
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on("line", async (line) => {
        const text = line.trim();
        if (text === "exit") {
            rl.close();
            es.close();
            await handle.close();
            process.exit();
        } else {
            const markerObj = {
                timestamp: new Date().toISOString(),
                marker: text
            };
            await handle.write(JSON.stringify(markerObj) + "\n");
        }
    });
    console.log("Listening for events...");

}

main();