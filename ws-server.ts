import { createServer } from "http";
import { Server } from "socket.io";

const PORT = parseInt(process.env.WS_PORT || "3002");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track connected users: socketId -> { userId, username }
const connectedUsers = new Map<string, { userId: string; username: string }>();

io.on("connection", (socket) => {
  // Client sends auth event with token data after connecting
  socket.on("auth", (data: { userId: string; username: string }) => {
    if (!data.userId || !data.username) {
      socket.disconnect();
      return;
    }

    connectedUsers.set(socket.id, { userId: data.userId, username: data.username });

    const users = Array.from(connectedUsers.values()).map(c => c.username);
    io.emit("message", JSON.stringify({
      type: "user:connected",
      username: data.username,
      count: connectedUsers.size,
      users,
    }));
  });

  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    connectedUsers.delete(socket.id);

    if (user) {
      const users = Array.from(connectedUsers.values()).map(c => c.username);
      io.emit("message", JSON.stringify({
        type: "user:disconnected",
        username: user.username,
        count: connectedUsers.size,
        users,
      }));
    }
  });
});

// HTTP endpoint for API routes to broadcast events
httpServer.on("request", (req, res) => {
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const { event, excludeUserId } = JSON.parse(body);

        if (excludeUserId) {
          // Send to all except the excluded user
          connectedUsers.forEach((user, socketId) => {
            if (user.userId !== excludeUserId) {
              io.to(socketId).emit("message", JSON.stringify(event));
            }
          });
        } else {
          // Send to all
          io.emit("message", JSON.stringify(event));
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
