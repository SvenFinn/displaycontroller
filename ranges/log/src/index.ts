import { logReaderStream } from "./streams/logReader";
import amqp from "amqplib";
import { isInternalRange } from "@shared/ranges/internal";
import { logger } from "dc-logger";

import "./cache/updater"; // Import the updater to start the caching
import { ServerStateStream } from "./streams/serverState";
import { LocalClient } from "dc-db-local";
import { LogParserStream } from "./streams/logParser";
import { MulticastStream } from "./streams/multicastRecv";
import { RangeMerger } from "./streams/mergeRange";
import { AccumulateRanges } from "./streams/accumulateRanges";
import { DebounceStream } from "./streams/debounce";
import { RabbitSenderStream } from "./streams/rabbitSender";
import { MulticastAccumulate } from "./streams/multicastAcc";


async function main() {
    logger.info("Connecting to rabbitmq");
    const connection = await amqp.connect("amqp://rabbitmq");
    const localClient = new LocalClient();

    const merger = new RangeMerger(localClient);

    const serverState = new ServerStateStream();
    const logReader = new logReaderStream(localClient);
    const logParser = new LogParserStream();
    const accumulateRanges = new AccumulateRanges();
    const debounceRanges = new DebounceStream(300);
    serverState.pipe(logReader).pipe(logParser).pipe(accumulateRanges).pipe(debounceRanges).pipe(merger);

    const multicastRecv = new MulticastStream(connection);
    const multicastAccumulate = new MulticastAccumulate();
    multicastRecv.pipe(multicastAccumulate).pipe(merger);

    const sender = new RabbitSenderStream(connection);
    merger.pipe(sender);
    logger.info("Connected to rabbitmq");
}

main();