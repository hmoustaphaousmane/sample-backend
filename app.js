const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const todoRouter = require("./router/router");
const authRouter = require("./router/userRouter");

// mongoose.connect("mongodb://localhost:27017/todo-test-db")
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Connected to database");
})
.catch(err => {
    console.log("Ann error occured while trying to connect::::", err);
});

const app = express();
const PORT = 3000;

// Midleware
app.use(express.json());

app.use("/auth", authRouter);
app.use("/todo", todoRouter);

app.listen(PORT, () => {
    console.log(`server has started on port ${PORT}`);
    
})
