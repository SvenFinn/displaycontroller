import express, { Express, Request, Response } from 'express';
import { LocalClient } from 'dc-db-local';
import { logger } from "dc-logger";
import { rangeManager } from '../rangeMan';

const app: Express = express();
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

app.get('/api/ranges/known/:rangeIp', async (req: Request, res: Response) => {
    const rangeIp: string = req.params.rangeIp;
    const knownRange = await localClient.knownRanges.findUnique(
        {
            where: {
                ipAddress: rangeIp,
            },
        }
    );
    if (knownRange) {
        res.status(200).send(knownRange);
    } else {
        res.status(404).send('Range not found');
    }
});

app.post('/api/ranges/known/:rangeIp', async (req: Request, res: Response) => {
    const rangeIp: string = req.params.rangeIp;
    const rangeId = parseInt(req.body);
    if (isNaN(rangeId)) {
        res.status(400).send('Invalid range ID');
        return;
    }
    const elements = rangeIp.split('.');
    if (elements.length !== 4 || elements.some((element) => isNaN(parseInt(element)) || parseInt(element) < 0 || parseInt(element) > 255)) {
        res.status(400).send('Invalid IP address');
        return;
    }
    const knownRange = await localClient.knownRanges.upsert({
        where: {
            ipAddress: rangeIp,
        },
        create: {
            ipAddress: rangeIp,
            rangeId: rangeId,
        },
        update: {
            rangeId: rangeId,
        },
    });
    res.status(200).send(knownRange);
});

app.delete('/api/ranges/known/:rangeIp', async (req: Request, res: Response) => {
    const rangeIp: string = req.params.rangeIp;
    const knownRange = await localClient.knownRanges.delete({
        where: {
            ipAddress: rangeIp,
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


app.listen(80, () => {
    logger.info('Listening on port 80');
});