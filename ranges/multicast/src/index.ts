import amqp from 'amqplib';
import { RabbitMqReceiver, RabbitMqWriter } from 'dc-streams';
import { isRangeProxy } from "../proxy/src/types";
import { RangeIdentifier } from './streams/rangeId';
import { createLocalClient } from 'dc-db-local';
import { CandidateExtractor } from './streams/candidates';
import { LongestMatchReducer } from './streams/longestMatchReducer';
import { RangeDataConverter } from './streams/rangeDataConverter';
import { InternalRange } from 'dc-ranges-types';
import "./cache";

async function main() {
    const localClient = await createLocalClient();
    const connection = await amqp.connect("amqp://rabbitmq");

    const receiver = new RabbitMqReceiver(connection, ["ranges.multicast.proxy"], isRangeProxy);

    const rangeIdentifier = new RangeIdentifier(localClient);
    const candidateExtractor = new CandidateExtractor();

    const longestMatchReducer = new LongestMatchReducer();

    const rangeDataConverter = new RangeDataConverter();
    const sender = new RabbitMqWriter<InternalRange>(connection, ["ranges.multicast"], (range) => range.rangeId.toString());

    receiver.pipe(rangeIdentifier).pipe(candidateExtractor).pipe(longestMatchReducer).pipe(rangeDataConverter).pipe(sender);
}

main()