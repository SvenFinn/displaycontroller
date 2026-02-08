import { Ssmdb2Client } from "dc-db-ssmdb2";
import { TypedReadable } from "dc-streams";
import { TableWatcherFast } from "dc-table-watcher";

export class TableWatcherStream extends TypedReadable<string[]> {
    private tableWatcher: TableWatcherFast;

    constructor(prisma: Ssmdb2Client, tables: string[], interval?: number, fastInterval?: number, fastTimeout?: number) {
        super();
        this.tableWatcher = new TableWatcherFast(prisma, tables, interval, fastInterval, fastTimeout);
        this.tableWatcher.on('change', (tables: string[]) => {
            this.push(tables);
        });
        this.tableWatcher.start();
    }

    _read() {
        // Do nothing
    }
}