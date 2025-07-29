import { logger } from "dc-logger";
import { createServer } from "http";
import { Server } from "socket.io";
import { startScreenCast, stopScreenCast } from "./amqp";


const server = createServer();
const io = new Server(server, {
    path: "/api/screenCast/ws/",
});



let broadcaster: string | null = null;
const viewers: Set<string> = new Set();

io.on("error", e => logger.error(e));
io.on("connection", socket => {
    socket.on("broadcaster", () => {
        if (broadcaster) {
            logger.warn("New broadcaster connected, rejecting");
            socket.emit("broadcasterRejected", "Another broadcaster is already connected.");
            return;
        }
        logger.info(`Broadcaster connected: ${socket.id}`);
        broadcaster = socket.id;
        // Emit broadcaster ID to all viewers
        socket.broadcast.emit("broadcaster", socket.id);

        for (const viewer of viewers) {
            logger.info(`Sending viewer to broadcaster: ${viewer}, ${socket.id}`);
            socket.emit("viewer", viewer);
        }

        startScreenCast();
    });

    socket.on("viewer", () => {
        logger.info(`Viewer registered: ${socket.id}`);
        viewers.add(socket.id);
        if (broadcaster) {
            socket.to(broadcaster).emit("viewer", socket.id);
            socket.emit("broadcaster", broadcaster);
        }
    });
    socket.on("offer", (id, message) => {
        socket.to(id).emit("offer", socket.id, message);
    });
    socket.on("answer", (id, message) => {
        socket.to(id).emit("answer", socket.id, message);
    });
    socket.on("candidate", (id, message) => {
        logger.info(`Candidate from ${socket.id} to ${id}`);
        socket.to(id).emit("candidate", socket.id, message);
    });
    socket.on("stopBroadcast", () => {
        logger.info(`Stop broadcast requested by ${socket.id}`);
        if (broadcaster !== socket.id) {
            logger.warn(`Stop broadcast request from non-broadcaster: ${socket.id}`);
            return;
        }
        broadcaster = null;
        stopScreenCast();
    });
    socket.on("disconnect", () => {
        if (socket.id === broadcaster) {
            logger.info(`Broadcaster disconnected: ${socket.id}`);
            broadcaster = null;
            stopScreenCast();
        } else {
            logger.info(`Viewer disconnected: ${socket.id}`);
            viewers.delete(socket.id);
            if (!broadcaster) return;
            socket.to(broadcaster).emit("viewerDisconnected", socket.id);
        }
    });
});

server.listen(80, () => console.log(`Server is running on port 80`));


