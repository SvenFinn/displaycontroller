import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { logger } from "dc-logger";
import { LocalClient } from 'dc-db-local';
import { getCurrentScreen, getPaused, gotoScreen, nextScreen, pauseScreen, previousScreen } from '../screens';
import { resolvePreset } from '../screens/presets';
import { DbScreen, Screen } from 'dc-screens-types';
dotenv.config();

const app: Express = express();
const localClient: LocalClient = new LocalClient();

let sseConnections: Response[] = [];

export async function sendSSEResponse(data: Screen) {
    logger.info("Sending screen update");
    sseConnections.forEach((socket) => {
        socket.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}

app.get('/api/screens', async (req: Request, res: Response) => {
    try {
        const screens = await localClient.screens.findMany();
        res.status(200).send(screens);
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/screens/current', (req: Request, res: Response) => {
    res.status(200).send(getCurrentScreen());
});

app.get('/api/screens/current/sse', (req: Request, res: Response) => {
    logger.info("New screens events connection");
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Content-Encoding': 'none',
    };
    res.writeHead(200, headers);

    res.write(`data: ${JSON.stringify(getCurrentScreen())}\n\n`);

    sseConnections.push(res);

    req.on("close", () => {
        sseConnections = sseConnections.filter((socket) => socket !== res);
    });
});

app.get('/api/screens/pause', (req: Request, res: Response) => {
    res.status(200).send(getPaused());
});

app.post('/api/screens/pause', (req: Request, res: Response) => {
    try {
        pauseScreen();
        res.status(200).send('Screen paused');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

app.post('/api/screens/next', (req: Request, res: Response) => {
    try {
        nextScreen();
        res.status(200).send('Next screen switched');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
    res.end();
});

app.post('/api/screens/previous', (req: Request, res: Response) => {
    try {
        previousScreen();
        res.status(200).send('Previous screen switched');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
    res.end();
});

app.get('/api/screens/:screenId', async (req: Request, res: Response) => {
    if (isNaN(Number(req.params.screenId))) {
        res.status(400).send('Invalid screen id');
        return;
    }
    const screenId = Number(req.params.screenId);
    const screen = await localClient.screens.findFirst({
        where: {
            id: screenId
        }
    });
    if (!screen) {
        res.status(404).send('Screen not found');
        return;
    }
    const screenWType = screen as unknown as DbScreen;
    res.status(200).send({
        "config": screenWType,
        "resolved": await resolvePreset(screenWType)
    });
})

app.put('/api/screens/:screenId', async (req: Request, res: Response) => {
    if (isNaN(Number(req.params.screenId))) {
        res.status(400).send('Invalid screen id');
        return;
    }
    const screenId = Number(req.params.screenId);
    try {
        await localClient.screens.upsert({
            where: {
                id: screenId
            },
            create: {
                id: screenId,
                ...req.body
            },
            update: {
                id: screenId,
                ...req.body
            }
        });
        res.status(200).send('Screen updated');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

app.delete('/api/screens/:screenId', (req: Request, res: Response) => {
    if (isNaN(Number(req.params.screenId))) {
        res.status(400).send('Invalid screen id');
        return;
    }
    const screenId = Number(req.params.screenId);
    try {
        localClient.screens.delete({
            where: {
                id: screenId
            }
        });
        res.status(200).send('Screen deleted');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

app.get('/api/screens/:screenId/:subScreenId', async (req: Request, res: Response) => {
    if (isNaN(Number(req.params.screenId))) {
        res.status(400).send('Invalid screen id');
        return;
    }
    const screenId = Number(req.params.screenId);
    const screen = await localClient.screens.findFirst({
        where: {
            id: screenId
        }
    });
    if (!screen) {
        res.status(404).send('Screen not found');
        return;
    }
    const screenWType = screen as unknown as DbScreen;
    const resolved = await resolvePreset(screenWType);
    if (!resolved) {
        res.status(500).send('Internal server error');
        return;
    }
    if (isNaN(Number(req.params.subScreenId))) {
        res.status(400).send('Invalid sub screen id');
        return;
    }
    const subScreenId = Number(req.params.subScreenId);
    if (subScreenId >= resolved.length) {
        res.status(404).send('Sub screen not found');
        return;
    }
    res.status(200).send(resolved[subScreenId]);
});

app.post('/api/screens/:screenId{/:subScreenId}', (req: Request, res: Response) => {
    if (isNaN(Number(req.params.screenId))) {
        res.status(400).send('Invalid screen id');
        return;
    }
    const screenId = Number(req.params.screenId);
    let subScreenId = 0;
    if (req.params.subScreenId) {
        if (isNaN(Number(req.params.subScreenId))) {
            res.status(400).send('Invalid sub screen id');
            return;
        }
        subScreenId = Number(req.params.subScreenId);
    }
    try {
        gotoScreen(screenId, subScreenId);
        res.status(200).send('Screen switched');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

app.listen(80, () => {
    logger.info('Listening on port 80');
});