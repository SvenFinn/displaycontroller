import { createSSMDB2Client } from "dc-db-ssmdb2";
import "./cache/updater"; // Import the cache updater
import { TableWatcherStream } from "./streams/tableWatcher";
import { StabilizerStream } from "./streams/rangeStabilizer";
import { RabbitMqWriter } from "dc-streams";
import amqp from "amqplib";
import { InternalRange } from "dc-ranges-types";
import { DbQueryStream } from "./streams/dbQuery";
import { RangeDataTranslator } from "./streams/rangeDataTranslator";

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
        .pipe(new DbQueryStream(ssmdb2Client))
        .pipe(new StabilizerStream(3000, 20000))
        .pipe(new RangeDataTranslator())
        .pipe(new RabbitMqWriter(connection, ["ranges.ssmdb2"], (value: InternalRange) => value.rangeId.toString()));
}

main();
