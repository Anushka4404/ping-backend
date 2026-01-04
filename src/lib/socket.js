import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173", // dev
  "https://ping-frontend6.onrender.com", // deployed frontend
];

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173"],
//   },
// });
const io = new Server(server, {
  cors: {
    // origin: function (origin, callback) {
    //   if (!origin || allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // },
    origin: ["http://localhost:5173", "https://ping-frontend6.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // {userId: [socketId, socketId...]}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId] || [];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = [];
    }
    userSocketMap[userId].push(socket.id);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    for (const id in userSocketMap) {
      userSocketMap[id] = userSocketMap[id].filter(sId => sId !== socket.id);
      if (userSocketMap[id].length === 0) {
        delete userSocketMap[id];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
