import express, { Express } from 'express';
import { createLocalClient, LocalClient } from 'dc-db-local';
import { logger } from "dc-logger";
import { rangeManager } from '../rangeMan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { isStartList, StartList } from 'dc-ranges/types';
import { registerEndpoint } from 'dc-endpoints';
import { createOrUpdateKnownRange, deleteKnownRange, getActiveRanges, getAllKnownRanges, getAllStartLists, getFreeRanges, getKnownRange, getRange } from 'dc-ranges/endpoints';

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
    path: '/api/ranges/ws'
}).of("/api/ranges");
rangeManager.setNamespace(io);

io.on('connection', (socket) => {
    logger.info('New WebSocket connection for ranges');
    const handshakeRanges = socket.handshake.query.ranges;
    let ranges: number[] | null = null;

    if (handshakeRanges) {
        const rawRanges = Array.isArray(handshakeRanges) ? handshakeRanges : JSON.parse(handshakeRanges);
        ranges = rawRanges
            .map((r: any) => parseInt(r.toString()))
            .filter((n: number) => !isNaN(n));
    }
    setTimeout(() => {
        rangeManager.addSocket(socket, ranges);
    }, 100);

    socket.on('disconnect', () => {
        logger.info('WebSocket disconnected for ranges');
    });
});

const localClient: LocalClient = createLocalClient();

registerEndpoint(app, getActiveRanges, async (params, query) => {
    return rangeManager.getActiveRanges();
});

registerEndpoint(app, getFreeRanges, async (params, query) => {
    return rangeManager.getFreeRanges();
});

registerEndpoint(app, getAllKnownRanges, async (params, query) => {
    const knownRanges = await localClient.knownRanges.findMany();
    return knownRanges;
});

registerEndpoint(app, getKnownRange, async (params, query) => {
    const rangeMac = params.rangeMac;
    const knownRange = await localClient.knownRanges.findUnique(
        {
            where: {
                macAddress: rangeMac,
            },
        }
    );
    if (knownRange) {
        return knownRange;
    } else {
        return {
            code: 404,
            message: "Range not found"
        };
    }
});

registerEndpoint(app, createOrUpdateKnownRange, async (params, query, body) => {
    const rangeMac = params.rangeMac;
    const rangeId = body.rangeId;
    const knownRange = await localClient.knownRanges.upsert({
        where: {
            macAddress: rangeMac,
        },
        create: {
            macAddress: rangeMac,
            rangeId: rangeId,
        },
        update: {
            rangeId: rangeId,
        },
    });
    return knownRange;
});

registerEndpoint(app, deleteKnownRange, async (params, query) => {
    const rangeMac = params.rangeMac;
    const knownRange = await localClient.knownRanges.delete({
        where: {
            macAddress: rangeMac,
        },
    });
    return knownRange;
});

registerEndpoint(app, getAllStartLists, async (params, query) => {
    const startListsDb = await localClient.cache.findMany({
        where: {
            type: "startList",
        },
    });
    let startLists: StartList[] = [];
    for (const entry of startListsDb) {
        if (isStartList(entry.value)) {
            startLists.push(entry.value);
        } else {
            logger.warn(`Cache entry with key ${entry.key} is not a valid StartList`);
        }
    }
    return startLists;
});

registerEndpoint(app, getRange, async (params) => {
    const rangeId = parseInt(params.rangeId);
    if (isNaN(rangeId)) {
        return {
            code: 400,
            message: "Invalid range ID"
        };
    }
    return rangeManager.getRangeData(rangeId);

});

server.listen(80, () => {
    logger.info('Listening on port 80');
});