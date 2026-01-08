import { createSSMDB2Client } from "dc-db-ssmdb2";
import "./cache/updater"; // Import the cache updater
import { TableWatcherStream } from "./streams/tableWatcher";
import { RangeDataStream } from "./streams/rangeData";
import { DebounceStream } from "./streams/debounce";
import { RabbitSenderStream } from "./streams/rabbitSender";
import { StabilizerStream } from "./streams/rangeStabilizer";

async function main() {
    const ssmdb2Client = await createSSMDB2Client();
    new TableWatcherStream(
        ssmdb2Client,
        ["Scheiben", "Treffer"],
        10000,
        100,
        30000,
    )
        .pipe(new RangeDataStream(ssmdb2Client))
        .pipe(new StabilizerStream(20000))
        .pipe(new DebounceStream(500))
        .pipe(new RabbitSenderStream());
}

main();
