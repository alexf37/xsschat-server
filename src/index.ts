import http from "http";
import { Server, Socket } from "socket.io";

// Configuration
interface Config {
    port: number;
}

const config: Config = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 80,
};

interface RoomData {
    room: string;
    name: string;
}

// Configure and init Socket.IO
function configureSocketIO(server: http.Server): Server {
    const io = new Server(server, {
        cors: {
            origin: /(([a-z]\.)*xsschat\.com)|(.\.vercel\.app)/,
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        let room: string | null = null;

        socket.on("join", (data: RoomData) => {
            room = data.room;
            socket.join(room);
            io.to(room).emit("join", data.name);
        });

        socket.on("message", (msg: string) => {
            if (room) {
                io.to(room).emit("message", msg);
            }
        });
    });

    return io;
}

// Main function
function main() {
    const httpServer = http.createServer();
    const io = configureSocketIO(httpServer);

    httpServer.listen(config.port, () => {
        console.log(`Socket.IO server running on port ${config.port}!`);
    });
}

main();