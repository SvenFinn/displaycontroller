import pino from "pino";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
        },
    },
});

process.on("SIGTERM", () => {
    logger.info("Received SIGTERM, exiting");
    process.exit(0);
});