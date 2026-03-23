import * as dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import routerc from './routes/chat.routes.js';
import routerm from './routes/message.routes.js';
import routeru from './routes/user.routes.js';
import connectDB from './db/connect.js';
import MessageModel from "./model/Messages.js";
import UsersModel from "./model/Users.js"; // ✅ ADDED

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ ONLINE USERS MAP
const onlineUsers = new Map();

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/v1/users', routeru);
app.use('/api/v1/message', routerm);
app.use('/api/v1/chat', routerc);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: CLIENT_ORIGIN,
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // ✅ SETUP USER SOCKET + ONLINE STATUS
  socket.on('setup', async (userData) => {
    socket.join(userData._id);

    // 🔥 ADD TO ONLINE USERS
    onlineUsers.set(userData._id.toString(), socket.id);

    // 🔥 UPDATE DB
    await UsersModel.findByIdAndUpdate(userData._id, {
      isOnline: true,
    });

    // 🔥 NOTIFY OTHERS
    socket.broadcast.emit("user online", userData._id);

    socket.emit("connected");
  });

  // ✅ JOIN CHAT ROOM
  socket.on('join chat', (room) => {
    socket.join(room);
  });

  // ✅ TYPING
  socket.on('typing', (room) => socket.to(room).emit('typing'));
  socket.on('stop typing', (room) => socket.to(room).emit('stop typing'));

  // ✅ NEW MESSAGE
  socket.on("new message", (newmessageReceive) => {
    const chat = newmessageReceive.chat;

    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id === newmessageReceive.sender._id) return;

      socket.to(user._id).emit("message recieved", newmessageReceive);
    });
  });

  // ✅ MESSAGE DELIVERED
  socket.on("message delivered", async (messageId) => {
    try {
      const msg = await MessageModel.findByIdAndUpdate(
        messageId,
        { status: "delivered" },
        { new: true }
      ).populate("chat");

      if (!msg || !msg.chat?.users) return;

      msg.chat.users.forEach((user) => {
        socket.to(user._id.toString()).emit("message delivered", messageId);
      });

    } catch (err) {
      console.log(err);
    }
  });

  // ✅ SEEN
  socket.on("mark seen", async (chatId) => {
    try {
      await MessageModel.updateMany(
        { chat: chatId },
        { status: "seen" }
      );

      socket.to(chatId).emit("messages seen", chatId);

    } catch (err) {
      console.log(err);
    }
  });

  // ✅ DISCONNECT + LAST SEEN
  socket.on("disconnect", async () => {
    console.log("user disconnected");

    let userId;

    // 🔍 FIND USER FROM MAP
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        userId = key;
        onlineUsers.delete(key);
        break;
      }
    }

    if (userId) {
      // 🔥 UPDATE DB
      await UsersModel.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // 🔥 NOTIFY OTHERS
      socket.broadcast.emit("user offline", userId);
    }
  });
});

const start = async () => {
  try {
    await connectDB(process.env.DB_CONNECT_URI);

    server.listen(PORT, () => {
      console.log('Server is Live');
    });

  } catch (err) {
    console.log(err);
  }
};

start();