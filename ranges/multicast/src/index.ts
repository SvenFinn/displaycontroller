import amqp from 'amqplib';
import { RabbitMqReceiver, RabbitMqWriter } from 'dc-streams';
import { isRangeProxy } from "../proxy/src/types";
import { RangeIdentifier } from './streams/rangeId';
import { createLocalClient } from 'dc-db-local';
import { CandidateExtractor } from './streams/candidates';
import { RangeDataConverter } from './streams/rangeDataConverter';
import { InternalRange } from 'dc-ranges-types';
import "./cache";
import { ConstraintSolver } from './streams/constraintSolver';
import { ContainedCandidatesFilter } from './streams/overlapFilter';

async function main() {
    const localClient = await createLocalClient();
    const connection = await amqp.connect("amqp://rabbitmq");

    const receiver = new RabbitMqReceiver(connection, ["ranges.multicast.proxy"], isRangeProxy);

    const rangeIdentifier = new RangeIdentifier(localClient);
    const candidateExtractor = new CandidateExtractor();

    const overlapFilter = new ContainedCandidatesFilter();
    const constraintSolver = new ConstraintSolver();

    const rangeDataConverter = new RangeDataConverter();
    const sender = new RabbitMqWriter<InternalRange>(connection, ["ranges.multicast"], (range) => range.rangeId.toString());

    receiver.pipe(rangeIdentifier).pipe(candidateExtractor).pipe(overlapFilter).pipe(constraintSolver).pipe(rangeDataConverter).pipe(sender);
}

main()