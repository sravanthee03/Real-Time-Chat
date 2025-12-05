// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");
const path = require("path");
const uploadRoutes = require("./routes/uploadRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ allowed origins (frontend URLs)
const allowedOrigins = [
  "http://localhost:5173",                            // local dev
  // "https://your-frontend-domain.vercel.app",       // ⬅️ add real Vercel URL here later
];

// CORS for normal HTTP requests
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// REST routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

// serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Socket.io CORS uses the SAME allowedOrigins
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io); // so routes can access socket.io if needed later

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_connected", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));
  });

  socket.on(
    "send_message",
    async ({ senderId, receiverId, content, imageUrl, audioUrl }) => {
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content: content || "",
        imageUrl: imageUrl || "",
        audioUrl: audioUrl || "",
      });

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }

      // echo back to sender
      socket.emit("message_sent", message);
    }
  );

  socket.on("disconnect", () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("online_users", Array.from(onlineUsers.keys()));
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
