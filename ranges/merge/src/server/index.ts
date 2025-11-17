import express, { Express, Request, Response } from 'express';
import { LocalClient } from 'dc-db-local';
import { logger } from "dc-logger";
import { rangeManager } from '../rangeMan';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
    path: '/api/ranges/ws',
    cors: {
        origin: '*'
    }
}).of("/api/ranges");
rangeManager.setNamespace(io);

io.on('connection', (socket) => {
    logger.info('New WebSocket connection for ranges');
    const handshakeRanges = socket.handshake.query.ranges;
    let ranges: number[] | null = null;

    if (handshakeRanges) {
        const rawRanges = Array.isArray(handshakeRanges) ? handshakeRanges : [handshakeRanges];
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

const localClient: LocalClient = new LocalClient();

app.get('/api/ranges', async (req: Request, res: Response) => {
    res.status(200).send(rangeManager.getActiveRanges());
});

app.get('/api/ranges/free', async (req: Request, res: Response) => {
    const freeRanges = rangeManager.getFreeRanges();
    res.status(200).send(freeRanges);
});

app.get('/api/ranges/sse', async (req: Request, res: Response) => {
    let ranges: number[] | null = null;
    if (req.query.ranges) {
        ranges = JSON.parse(req.query.ranges.toString()).map((range: any) => parseInt(range.toString())).filter((range: number) => !isNaN(range));
    }
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Content-Encoding': 'none',
    };
    res.writeHead(200, headers);

    rangeManager.addSSE(res, ranges);

    req.on("close", () => {
        rangeManager.removeSSE(res);
    });
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
    const rangeId = parseInt(req.body);
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