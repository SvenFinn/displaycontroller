import { createSocket, RemoteInfo } from "dgram";
import { logger } from "dc-logger";
import { RangeProxyType } from "./types";
import amqp from "amqplib";
import { decode } from "iconv-lite";
import dotenv from "dotenv";
import { getTable, toMAC } from "@network-utils/arp-lookup";

dotenv.config();

if (!process.env.MULTICAST_MSG_MIN_LENGTH) {
    logger.error("MULTICAST_MSG_MIN_LENGTH is not defined");
    process.exit();
}
const MESSAGE_MIN_LENGTH = parseInt(process.env.MULTICAST_MSG_MIN_LENGTH);

async function main() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue("ranges.multicast.proxy", {
        durable: false,
        autoDelete: true,
        messageTtl: 30000
    });

    const client = createSocket("udp4");
    client.on("listening", function () {
        client.setMulticastTTL(128);
        try {
            client.addMembership("2224.0.0.1");
        } catch (e) {
        }
        const address = client.address();
        logger.info(`UDP Client listening on ${address.address}:${address.port}`);
    });
    client.on("message", async function (message: Buffer, remote: RemoteInfo) {
        if (remote.family !== "IPv4") {
            logger.warn("Received message from non-IPv4 address");
            return;
        }
        logger.debug(`Received message of length ${message.length} from ${remote.address}`);
        if (message.length < MESSAGE_MIN_LENGTH) {
            logger.warn(`Received short message (${message.length} < ${MESSAGE_MIN_LENGTH}) from ${remote.address}`);
            return;
        }
        const senderMac = await getMac(remote.address);
        if (!senderMac) {
            logger.warn(`Could not resolve MAC address for ${remote.address}`);
            return;
        }
        const messageStr = decode(message, 'windows-1252');
        const proxiedMessage: RangeProxyType = {
            ip: remote.address,
            mac: senderMac,
            message: Buffer.from(messageStr).toString("base64")
        }
        logger.debug(`Received message from ${remote.address}`);
        channel.sendToQueue("ranges.multicast.proxy", Buffer.from(JSON.stringify(proxiedMessage)));
    });
    client.on("error", function (error) {
        logger.error(error);
        process.exit();
    });
    client.bind(49497, "0.0.0.0");
}

async function getMac(ip: string): Promise<string | null> {
    const mac = await toMAC(ip);
    if (!mac) {
        // Ping the device to populate the ARP table
        await new Promise<void>((resolve) => {
            const socket = createSocket("udp4");
            socket.on("error", () => {
                socket.close();
                resolve();
            });
            socket.send("", 9, ip, () => {
                socket.close();
                setTimeout(resolve, 500); // Wait a bit for the ARP table to
            });
        });
        // Try again to get the MAC address
        return await toMAC(ip);
    }
    return mac;
}

main();

process.on('SIGTERM', function () {
    process.exit();
});