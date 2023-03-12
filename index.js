const express = require("express");
const mongoose = require("mongoose");
const app = require("./app");
const PORT = 4000;

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const http = require("http").Server(app);
const cors = require("cors");

const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});
io.use((socket, next) => {
  const { userId, username } = socket.handshake.auth;

  if (!userId) {
    return next(new Error("UserId is missing!"));
  }
  socket.userId = userId;
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      socketId: id,
      userId: socket.userId,
      username: socket.username,
    });
  }
  socket.emit("users", users);

  socket.broadcast.emit("user connected", {
    socketId: socket.id,
    userId: socket.userId,
    username: socket.username,
  });
  socket.on("private message", ({ content, to }) => {
    socket.to(to).emit("private message", {
      content: content.newMessage,
      from: socket.userId,
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnected", {
      socketId: socket.id,
      userId: socket.userId,
      username: socket.username,
    });
  });
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

http.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
