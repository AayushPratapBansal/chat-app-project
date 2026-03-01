const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const Message = require("./models/messageModel");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
const users = {}; 
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join", (username) => {
    users[username] = socket.id;
    console.log(`${username} joined with socket ID: ${socket.id}`);
  });

  socket.on("send_message", async (data) => {
    const { sender, receiver, content } = data;

    const newMessage = await Message.create({ sender, receiver, content });

    if (users[receiver]) {
      io.to(users[receiver]).emit("receive_message", newMessage);
    }

    if (users[sender]) {
      io.to(users[sender]).emit("receive_message", newMessage);
    }
  });

  socket.on("disconnect", () => {
    for (let user in users) {
      if (users[user] === socket.id) delete users[user];
    }
    console.log("User disconnect", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
