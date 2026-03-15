const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/messageModel");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5175",
      "https://chat-app-project-dusky.vercel.app",
    ],
    credentials: true,
  }),
);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5175",
      "https://chat-app-project-dusky.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    users[username] = socket.id;
    console.log(`${username} joined with socket ID: ${socket.id}`);
  });

  socket.on("send_message", async (data) => {
    const { sender, receiver, content, tempId } = data;

    try {
      const newMessage = await Message.create({
        sender,
        receiver,
        content,
      });

      const messageWithTemp = {
        ...newMessage._doc,
        tempId,
      };

      if (users[receiver]) {
        io.to(users[receiver]).emit("receive_message", messageWithTemp);
      }

      if (users[sender]) {
        io.to(users[sender]).emit("receive_message", messageWithTemp);
      }
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
