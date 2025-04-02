import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import { EventSource } from "eventsource";
import { logger } from "dc-logger";

export class TableWatcher extends EventEmitter {
    private prisma: PrismaClient;
    private tables: string[];
    private interval: number;
    private checksums: Record<string, BigInt> = {};
    private nodeInterval: NodeJS.Timeout | null = null;
    private serverState: boolean = false;
    private running: boolean = false;

    constructor(prisma: PrismaClient, tables: string[], interval: number = 10000) {
        super();
        this.prisma = prisma;
        this.tables = tables;
        this.interval = interval;
        for (let i = 0; i < this.tables.length; i++) {
            this.checksums[this.tables[i]] = 0n;
        }
        const events = new EventSource("http://server-state:80/api/serverState/sse");
        events.onopen = () => {
            logger.info("Connected to server state events");
        }
        events.onmessage = async (event: MessageEvent) => {
            logger.info("Received server state");
            const curState = JSON.parse(event.data as string);
            if (curState != this.serverState) {
                this.serverState = curState;
                if (this.serverState) {
                    await this.startInternal();
                } else {
                    await this.stopInternal();
                }
            }
        }
    }

    private async startInternal() {
        this.stopInternal();
        if (this.running) {
            this.nodeInterval = setInterval(() => this.watch(), this.interval);
            await this.watch();
        }
    }

    public async stopInternal() {
        if (this.nodeInterval !== null) {
            clearInterval(this.nodeInterval);
        }
    }

    public async start() {
        this.running = true;
        if (this.serverState) {
            this.startInternal();
        }
    }

    public async stop() {
        this.running = false;
        this.stopInternal();
    }

    public async setInterval(interval: number) {
        this.interval = interval;
        this.startInternal();
    }

    public getInterval(): number {
        return this.interval;
    }

    protected async watch() {
        logger.debug("Checking table checksums");
        let changed: string[] = [];
        await Promise.all(this.tables.map(async (table) => {
            try {
                let checksum = await this.prisma.$queryRawUnsafe(`CHECKSUM TABLE ${table}`) as [{ Table: string, Checksum: BigInt }];
                if (checksum.length != 1) {
                    throw new Error("Invalid checksum response");
                }
                const checksumValue = checksum[0].Checksum;
                if (checksumValue !== this.checksums[table]) {
                    changed.push(table);
                    this.checksums[table] = checksumValue;
                }
            } catch (error) {
                logger.warn(`Failed to get checksum for table: ${table}`);
                return;
            }
        }));
        if (changed.length > 0) {
            this.emit('change', changed);
        }
    }

    public on(event: 'change', listener: (tables: string[]) => void): this {
        return super.on(event, listener);
    }
}

export class TableWatcherFast extends TableWatcher {
    // If this detects a change, it will increase the check interval to the fast interval
    // It should then check with the fast interval for 30 seconds, and go back to the normal interval if no changes are detected
    private slowInterval: number;
    private fastInterval: number;
    private fastTimeout: number;
    private fastIntervalTimeout: NodeJS.Timeout | null = null;

    constructor(prisma: PrismaClient, tables: string[], interval: number = 10000, fastInterval: number = 1000, fastTimeout: number = 30000) {
        super(prisma, tables, interval);
        this.slowInterval = interval;
        this.fastInterval = fastInterval;
        this.fastTimeout = fastTimeout;
        this.on('change', this.changeInterval);
    }

    private changeInterval() {
        if (this.fastIntervalTimeout !== null) {
            clearTimeout(this.fastIntervalTimeout);
        }
        if (this.getInterval() !== this.fastInterval) {
            logger.debug("Change detected, increasing interval");
            this.setInterval(this.fastInterval);
        }
        this.fastIntervalTimeout = setTimeout(() => {
            this.setInterval(this.slowInterval);
        }, this.fastTimeout);
    }
}