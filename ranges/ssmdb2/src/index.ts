import { createSSMDB2Client } from "dc-db-ssmdb2"
import "./cache/updater"; // Import the cache updater
import { TableWatcherStream } from "./streams/tableWatcher";
import { RangeDataStream } from "./streams/rangeData";
import { DebounceStream } from "./streams/debounce";
import { RabbitSenderStream } from "./streams/rabbitSender";

const lastRangeStates: Map<number, string> = new Map();
const nextRangeStateTimeouts: Map<number, NodeJS.Timeout> = new Map();

async function main() {
    const ssmdb2Client = await createSSMDB2Client();
    const tableWatcherStream = new TableWatcherStream(ssmdb2Client, ["Scheiben", "Treffer"], 10000, 100, 30000);
    const rangeDataStream = tableWatcherStream.pipe(new RangeDataStream(ssmdb2Client));
    const debounceStream = rangeDataStream.pipe(new DebounceStream(500));
    debounceStream.pipe(new RabbitSenderStream());
}


main();
