const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const todoRouter = require("./router/router");
const authRouter = require("./router/userRouter");
const paystackRouter = require("./router/paystackRouter");
const messageRouter = require("./router/messageRouter");
const cronRouter = require("./router/cronRouter");
const uploads = require("./utility/multerConfig");
const uploadFile = require("./utility/fileUpload");

const { createServer } = require("node:http");
const { Server } = require("socket.io");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Ann error occured while trying to connect::::", err);
  });

const app = express();
// const app = require('express')();
const PORT = 3000;

const httpServer = createServer(app);
// const server = require('http').createServer(app);

const ioServer = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: "GET, POST, PUT, PATCH, DELETE",
  },
});
// const io = require('socket.io')(server);

// Midleware
app.use(express.json());

// Add the ioServer event object to response
// (which allows to emit an ioServer event from any of the defined routes)
app.use((req, res, next) => {
  // res.io = ioServer;
  req.io = ioServer;
  next();
});

app.use("/auth", authRouter);
app.use("/todo", todoRouter);
app.use("/paystck", paystackRouter);
app.use("/message", messageRouter);
app.use("/scheduler", cronRouter);

app.post("/file-uploads", uploads.single("file"), async (req, res) => {
  console.log("File propreties", req.file);
  const fileDetails = await uploadFile(req.file);
  console.log("File details:", fileDetails);

  res.send({
    message: "File uploaded successfully",
    fileDetails,
  });
});

app.get("/ping", (req, res) => {
  req.io.to(req.body.to).emit("send-message", {
    message: req.body.message,
  });
  res.send("pong");
});

// Middleware to authenticate a user
ioServer.use((socket, next) => {
  const auth = socket.handshake.headers.authorization;
  const [type, token] = auth.split(" ");
  console.log("type", type, "token", token);
  if (type.toLocaleLowerCase() == "bearer") {
    const value = jwt.verify(token, process.env.JWT_KEY);
    // console.log(value);
    socket.handshake.auth.decoded = value;
  } else {
    socket.send("You need to supply an authorization token");
  }
  next();
});

// Todo: Use Redis to store connections (connected users)
// let connections = [];

// Todo: write this part in another file (create file/folder for all event handlers)
const sendMessage = (payload) => {
  // Todo (on live app): save the message on the database
  // (create a chat if there is no any)
  // const userConnection = connections.find(
  //   (connection) => connection.userId == message.userId
  // );
  // if (!userConnection) return;
  // socket.to(userConnection.socketId).emit("send-message", message.message);

  socket.to(payload.to).emit("send-message", payload.message);
};

ioServer.on("connection", (socket) => {
  //   connections.push(socket.id);

  const decoded = socket.handshake.auth.decoded;

  console.log("Welcome", socket.id);
  console.log("socket.handshake.auth.decoded:", socket.handshake.auth.decoded);

  // connections.push({
  //   userId: decoded.userId,
  //   socketId: socket.id,
  // });

  // socket.join(socket.id);
  socket.join(decoded.userId);

  // socket.emit("newuserconnected", connections);

  socket.on("send-message", sendMessage);

  // console.log(connections.length, "user(s) connected");

  socket.on("disconnect", () => {
    // connections = connections.filter((connection) => connection != socket.id);
    // console.log(connections.length, "user(s) connected");
    socket.leave(decoded.userId);
    console.log("Goodbaye", socket.id, "with user Id", decoded.userId);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
