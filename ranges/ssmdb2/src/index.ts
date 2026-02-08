import { createSSMDB2Client } from "dc-db-ssmdb2";
import "./cache/updater"; // Import the cache updater
import { TableWatcherStream } from "./streams/tableWatcher";
import { RangeDataStream } from "./streams/rangeData";
import { StabilizerStream } from "./streams/rangeStabilizer";
import { DebounceTransform, RabbitMqWriter } from "dc-streams";
import { SSMDB2InternalRange } from "./types";
import amqp from "amqplib";

async function main() {
    const connection = await amqp.connect("amqp://rabbitmq");
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
        .pipe(new DebounceTransform((value: SSMDB2InternalRange) => value.rangeId.toString(), 500))
        .pipe(new RabbitMqWriter(connection, ["ranges.ssmdb2"], (value: SSMDB2InternalRange) => value.rangeId.toString()));
}

main();
