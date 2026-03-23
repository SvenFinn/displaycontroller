import { createLocalClient, LocalClient } from "./index.js";

async function ensureParameterExists(
    client: LocalClient,
    key: string,
    value: string | number | boolean
) {
    await client.parameter.upsert({
        where: { key },
        update: {},
        create: {
            key,
            strValue: typeof value === "string" ? value : null,
            numValue: typeof value === "number" ? value : null,
            boolValue: typeof value === "boolean" ? value : null,
        }
    });
}

async function main() {
    const client = createLocalClient();

    await Promise.all([
        ensureParameterExists(client, 'SM_SERVER_IP', '192.168.10.200'),
        ensureParameterExists(client, 'ENABLE_TIME_SYNC', true),
        ensureParameterExists(client, 'ENABLE_EVALUATION_SYNC', true),
        ensureParameterExists(client, 'TIME_SYNC_INTERVAL', 600000),
        ensureParameterExists(client, 'EVALUATION_SYNC_INTERVAL', 60000),
        ensureParameterExists(client, 'FREE_RANGE_SHOT_TIMEOUT', 1800000)
    ])
}

main();