import express, { Express, Request, Response } from 'express';
import { createLocalClient, LocalClient } from 'dc-db-local';
import { logger } from "dc-logger";
import { rangeManager } from '../rangeMan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { isStartList } from 'dc-ranges-types';

const app: Express = express();
// Parse JSON request bodies so that POST/PUT handlers can read req.body fields
// (e.g. rangeId in POST /api/ranges/known/:rangeMac).
app.use(express.json());
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
        try {
            const rawRanges = Array.isArray(handshakeRanges) ? handshakeRanges : JSON.parse(handshakeRanges);
            ranges = rawRanges
                .map((r: any) => parseInt(r.toString()))
                .filter((n: number) => !isNaN(n));
        } catch (error) {
            logger.warn(`Invalid ranges JSON in handshake: ${error}`);
            ranges = null;
        }
    }
    setTimeout(() => {
        rangeManager.addSocket(socket, ranges);
    }, 100);

    socket.on('disconnect', () => {
        logger.info('WebSocket disconnected for ranges');
    });
});

const localClient: LocalClient = createLocalClient();

app.get('/api/ranges', async (req: Request, res: Response) => {
    res.status(200).send(rangeManager.getActiveRanges());
});

app.get('/api/ranges/free', async (req: Request, res: Response) => {
    const freeRanges = rangeManager.getFreeRanges();
    res.status(200).send(freeRanges);
});

app.get('/api/ranges/known', async (req: Request, res: Response) => {
    const knownRanges = await localClient.knownRanges.findMany();
    res.status(200).send(knownRanges);
});

app.get('/api/ranges/known/:rangeMac', async (req: Request, res: Response) => {
    const rangeMac: string = req.params.rangeMac;
    const knownRange = await localClient.knownRanges.findUnique(
        {
            where: {
                macAddress: rangeMac,
            },
        }
    );
    if (knownRange) {
        res.status(200).send(knownRange);
    } else {
        res.status(404).send('Range not found');
    }
});

app.post('/api/ranges/known/:rangeMac', async (req: Request, res: Response) => {
    const rangeMac: string = req.params.rangeMac;
    const rangeId = parseInt(req.body?.rangeId);
    if (isNaN(rangeId)) {
        res.status(400).send('Invalid range ID');
        return;
    }
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
    res.status(200).send(knownRange);
});

app.delete('/api/ranges/known/:rangeMac', async (req: Request, res: Response) => {
    const rangeMac: string = req.params.rangeMac;
    const knownRange = await localClient.knownRanges.delete({
        where: {
            macAddress: rangeMac,
        },
    });
    res.status(200).send(knownRange);
});

app.get('/api/ranges/start-lists', async (req: Request, res: Response) => {
    logger.info("GET /api/ranges/start-lists");
    const startListsDb = await localClient.cache.findMany({
        where: {
            type: "startList",
        },
    });
    const startLists = startListsDb
        .map(sl => sl.value)
        .filter(isStartList);
    res.status(200).send(startLists);
});

app.get('/api/ranges/:rangeId', async (req: Request, res: Response) => {
    logger.info("GET /api/ranges/:range");
    const range: number = parseInt(req.params.rangeId);
    if (isNaN(range)) {
        res.status(400).send('Invalid range ID');
        return;
    }
    const rangeData = rangeManager.getRangeData(range);
    if (rangeData) {
        res.status(200).send(rangeData);
    } else {
        res.status(404).send('Range not found');
    }
});


server.listen(80, () => {
    logger.info('Listening on port 80');
});