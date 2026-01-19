import { app } from "./app.js";
import connectDB from "./config/db.js";
import { Server } from "socket.io";
import { setupGameSocket } from "./sockets/game.socket.js";

const start = async () => {
  try {
    await connectDB();
    await app.listen({
      port: process.env.PORT || 4000,
      host: "0.0.0.0",
    });
    console.log("🚀 Server running");

    // Setup Socket.IO
    const io = new Server(app.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    // Setup game socket namespace
    setupGameSocket(io);

    console.log("🔌 Socket.IO initialized");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
