import amqp from "amqplib";
import { logger } from "dc-logger";
import "./cache/updater"; // Import the updater to start the caching
import { ServerStateStream } from "./streams/serverState";
import { createLocalClient } from "dc-db-local";
import { MulticastStream } from "./streams/multicastRecv";
import { RangeMerger } from "./streams/mergeRange";
import { DebounceStream } from "./streams/debounce";
import { RabbitSenderStream } from "./streams/rabbitSender";
import { MulticastAccumulate } from "./streams/multicastAcc";
import { LogTailStream } from "./streams/logTail";
import { CsvLineStream } from "./streams/csvLines";
import { LogLineStream } from "./streams/logLine";
import { RangeStateStream } from "./streams/rangeState";


async function main() {
    logger.info("Connecting to rabbitmq");
    const connection = await amqp.connect("amqp://rabbitmq");
    const localClient = createLocalClient();

    const rangeMerger = new RangeMerger(localClient);

    const serverState = new ServerStateStream();
    const logTail = new LogTailStream(localClient);
    const csvLines = new CsvLineStream();
    const logLines = new LogLineStream();
    const rangeState = new RangeStateStream();
    const rangeDebounce = new DebounceStream(300);
    serverState
        .pipe(logTail)
        .pipe(csvLines)
        .pipe(logLines)
        .pipe(rangeState)
        .pipe(rangeDebounce)
        .pipe(rangeMerger);

    const multicastRecv = new MulticastStream(connection);
    const multicastAccumulate = new MulticastAccumulate();
    multicastRecv.pipe(multicastAccumulate).pipe(rangeMerger);

    const rangePublisher = new RabbitSenderStream(connection);
    rangeMerger.pipe(rangePublisher);
    logger.info("Connected to rabbitmq");
}

main();