import amqp from "amqplib";
import { logger } from "dc-logger";
import "./cache/updater"; // Import the updater to start the caching
import { ServerStateStream } from "./streams/serverState";
import { createLocalClient } from "dc-db-local";
import { RangeMerger } from "./streams/mergeRange";
import { MulticastAccumulate } from "./streams/multicastAcc";
import { LogTailStream } from "./streams/logTail";
import { CsvLineStream } from "./streams/csvLines";
import { LogLineStream } from "./streams/logLine";
import { RangeStateStream } from "./streams/rangeState";
import { DebounceTransform, RabbitMqReceiver, RabbitMqWriter } from "dc-streams";
import { InternalRange, isInternalRange } from "dc-ranges/types";


async function main() {
    logger.info("Connecting to rabbitmq");
    const connection = await amqp.connect("amqp://rabbitmq");
    const localClient = createLocalClient();

    const rangeMerger = new RangeMerger();

    const serverState = new ServerStateStream();
    const logTail = new LogTailStream(localClient);
    const csvLines = new CsvLineStream();
    const logLines = new LogLineStream();
    const rangeState = new RangeStateStream(localClient);
    const rangeDebounce = new DebounceTransform((value: InternalRange) => value.rangeId.toString(), 300);
    serverState
        .pipe(logTail)
        .pipe(csvLines)
        .pipe(logLines)
        .pipe(rangeState)
        .pipe(rangeDebounce)
        .pipe(rangeMerger);

    const multicastRecv = new RabbitMqReceiver(connection, ["ranges.multicast"], isInternalRange);
    const multicastAccumulate = new MulticastAccumulate();
    multicastRecv.pipe(multicastAccumulate).pipe(rangeMerger);

    const rangePublisher = new RabbitMqWriter(connection, ["ranges.log"], (value: InternalRange) => value.rangeId.toString());
    rangeMerger.pipe(rangePublisher);
    logger.info("Connected to rabbitmq");
}

main();