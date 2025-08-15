import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { logger } from "dc-logger";
import { LocalClient } from 'dc-db-local';
import { screenManager } from '../screens/screenManager';
import { resolveScreen } from '../screens/types';
import { DbScreen, isDbScreen, Screen } from 'dc-screens-types';
import BodyParser from 'body-parser';
import { Prisma } from 'dc-db-local/generated/client/client';
dotenv.config();

const app: Express = express();
app.use(BodyParser.json());

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
    res.status(200).send(screenManager.getCurrentScreen());
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

    res.write(`data: ${JSON.stringify(screenManager.getCurrentScreen())}\n\n`);

    sseConnections.push(res);

    req.on("close", () => {
        sseConnections = sseConnections.filter((socket) => socket !== res);
    });
});

app.get('/api/screens/pause', (req: Request, res: Response) => {
    res.status(200).send(screenManager.getPaused());
});

app.post('/api/screens/pause', (req: Request, res: Response) => {
    try {
        screenManager.pauseScreen();
        res.status(200).send('Screen paused');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

app.post('/api/screens/next', (req: Request, res: Response) => {
    try {
        screenManager.nextScreen();
        res.status(200).send('Next screen switched');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
    res.end();
});

app.post('/api/screens/previous', (req: Request, res: Response) => {
    try {
        screenManager.previousScreen();
        res.status(200).send('Previous screen switched');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
    res.end();
});

app.post('/api/screens/resolve', async (req: Request, res: Response) => {
    if (!req.body) {
        res.status(400).send('No screen data provided');
        return;
    }
    if (!isDbScreen(req.body)) {
        res.status(400).send('Invalid screen data');
        return;
    }
    const screen = req.body;
    try {
        const resolvedScreens = await resolveScreen(screen);
        res.status(200).send(resolvedScreens);
    } catch (error) {
        res.status(500).send(`Internal server error: ${error}`);
    }
});

app.put('/api/screens/swap/:screenId/:otherScreenId', async (req: Request, res: Response) => {
    const screenId = Number(req.params.screenId);
    const otherScreenId = Number(req.params.otherScreenId);
    if (isNaN(screenId) || isNaN(otherScreenId)) {
        res.status(400).send('Invalid screen id');
        return;
    }
    // Check this would not create any holes in the sequence
    if (screenId < 1 || otherScreenId < 1 || screenId === otherScreenId) {
        res.status(400).send('Invalid screen ids');
        return;
    }
    try {
        const screen = await localClient.screens.findFirst({
            where: { id: screenId }
        });
        const otherScreen = await localClient.screens.findFirst({
            where: { id: otherScreenId }
        });
        if (!screen || !otherScreen) {
            res.status(404).send('Screen not found');
            return;
        }
        const TEMP_SCREEN_ID = -1; // Temporary ID to swap screens
        await localClient.$transaction([
            localClient.screens.update({
                where: { id: screenId },
                data: { id: TEMP_SCREEN_ID }
            }),
            localClient.screens.update({
                where: { id: otherScreenId },
                data: { id: screenId }
            }),
            localClient.screens.update({
                where: { id: TEMP_SCREEN_ID },
                data: { id: otherScreenId }
            })
        ], {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        });
        res.status(200).send('Screens swapped');
    } catch (error) {
        logger.error(error);
        res.status(500).send('Internal server error');
    }
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
    res.status(200).send(screenWType);
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

app.delete('/api/screens/:screenId', async (req: Request, res: Response) => {
    if (isNaN(Number(req.params.screenId))) {
        res.status(400).send('Invalid screen id');
        return;
    }
    const screenId = Number(req.params.screenId);
    try {
        await localClient.screens.delete({
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
    const resolved = await resolveScreen(screenWType);
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
        screenManager.gotoScreen(screenId, subScreenId);
        res.status(200).send('Screen switched');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

app.post("/api/screens", async (req: Request, res: Response) => {
    if (!req.body || !isDbScreen(req.body)) {
        res.status(400).send('Invalid screen data');
        return;
    }
    const screen = req.body;
    if (screen.type == "systemMessage" || screen.type == "screenCast") {
        res.status(400).send('Cannot create systemMessage or screenCast screens via API');
        return;
    }
    try {

        await localClient.$transaction(async (tx) => {
            const maxIdRecord = await tx.screens.aggregate({
                _max: { id: true },
            });

            const nextId = (maxIdRecord._max.id ?? 0) + 1;
            const newScreen = await tx.screens.create({
                data: {
                    ...screen,
                    id: nextId,
                    conditions: screen.conditions || Prisma.JsonNull
                },
            });

            return newScreen;
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        });
        res.status(201).send(screen);
    } catch (error) {
        logger.error(error);
        res.status(500).send(error);
    }
});

app.listen(80, () => {
    logger.info('Listening on port 80');
});